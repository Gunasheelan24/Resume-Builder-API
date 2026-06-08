import bcrypt from 'bcryptjs';

import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { LoggerService } from 'src/common/logger/logger.service';
import { JwtService } from '@nestjs/jwt';
import {
  HttpResponseFailedMessages,
  HttpResponseMessages,
  sentBackResponse,
} from 'src/common/util/constant';
import type {
  createAccountData,
  RequestWithUser,
  ResetPasswordType,
  UserSignin,
} from './types/types';
import { EmailClientService } from 'src/email/email-client.service';
import { generateOtpHandler } from 'src/common/util/global.method';
import { SendEmailType } from 'src/email/types/email.types';
import { OtpEntity } from './entities/otp';
import { VerifyOtpDto } from './dto/otp-user';

@Injectable()
export class AuthService {
  // properties
  private readonly logger = new LoggerService();

  // Class constructor
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(OtpEntity)
    private readonly otpRepository: Repository<OtpEntity>,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailClientService,
  ) {}

  async createAccount(body: CreateUserDto) {
    try {
      const { userName, email } = body;

      // Validating the user email or userName
      const isUserExist = await this.userRepository.exists({
        where: [{ email }, { userName }],
      });

      // check the user exist or not
      if (!isUserExist) {
        // Need to hash the password before storing
        const hashedPassword = await this.hashPassword(body.password);

        // Need to create a new user obejct
        const userObject = this.userRepository.create({
          fullName: body.fullName,
          password: hashedPassword,
          userName,
          email,
        });

        // here storing the user in DB
        const createUser = await this.userRepository.save(userObject);

        // jwt token
        const jwtToken = await this.generateJwtToken({
          email: createUser.email,
          id: createUser.id,
        });

        // sentback response
        const responsePayload = {
          email: body.email,
          userName: body.userName,
          token: jwtToken,
        };

        return sentBackResponse<createAccountData>(
          { ...responsePayload },
          HttpStatus.CREATED,
          true,
          'User Created Successfull',
        );
      }

      // if user already exist will throw this below error
      throw new UnauthorizedException(HttpResponseFailedMessages.userExist);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.warn(error.message, error.stack);
      } else {
        this.logger.warn('unknow error');
      }

      throw error;
    }
  }

  async signInToAccount(body: UserSignin) {
    try {
      // need to check the user is already have an account
      const { email, password } = body;
      const getUser = await this.userRepository.findOne({
        where: { email },
        select: { password: true, email: true, provider: true, userName: true },
      });

      // invalid error
      if (!getUser) {
        throw new UnauthorizedException(HttpResponseFailedMessages.invalidUser);
      }

      // here need to compare the password
      const isPasswordCorrect = await this.comparePassword(
        password,
        getUser.password,
      );

      if (!isPasswordCorrect) {
        throw new UnauthorizedException(HttpResponseFailedMessages.invalidUser);
      }

      // need to generate the jwt
      const jwtPayload = {
        id: getUser.id,
        email,
      };
      const generatedJwt = await this.generateJwtToken(jwtPayload);

      // sent back response
      return sentBackResponse<{
        email: string;
        userName: string;
        token: string;
      }>(
        {
          email,
          token: generatedJwt,
          userName: getUser.userName,
        },
        HttpStatus.ACCEPTED,
        true,
        HttpResponseMessages.userVerification,
      );
    } catch (error) {
      if (error instanceof Error) {
        this.logger.warn(error.message, error.stack);
      } else {
        this.logger.warn('unknow error');
      }

      throw error;
    }
  }

  async sentResetPasswordOtp(body: ResetPasswordType) {
    try {
      // check the user exist or not
      const userDetails = await this.userRepository.findOne({
        where: { email: body.email },
      });

      if (userDetails) {
        // generate otp
        const generateOtp = generateOtpHandler();

        // hasing the otp
        const hashedOtp = await this.hashPassword(generateOtp);

        // payload
        const emailPayload: SendEmailType = {
          otp: generateOtp,
          to: body.email,
          subject: 'Password Reset Verification Code',
          userName: userDetails?.fullName,
        };

        // now for the email we need to sent the otp with a link
        const mailResponse =
          await this.emailService.prepareEmailObject(emailPayload);

        // Here saving the otp to db
        const createOtp = this.otpRepository.create({
          otp: hashedOtp,
          user: userDetails,
        });

        await this.otpRepository.save(createOtp);

        // Sent back response
        if (mailResponse?.length > 0 && mailResponse?.[0]?.statusCode == 202) {
          return sentBackResponse<{ email: string; message: string }>(
            {
              email: body.email,
              message: HttpResponseMessages.sentEmailSuccess,
            },
            HttpStatus.CREATED,
          );
        }

        // if the email sent failed
        throw new HttpException(
          HttpResponseFailedMessages.failedToSentEmail,
          HttpStatus.BAD_REQUEST,
        );
      }

      // if user does't exist
      throw new UnauthorizedException(HttpResponseFailedMessages.invalidUser);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(error.message, error.stack);
      } else {
        this.logger.warn('unknow error');
      }

      throw error;
    }
  }

  async verifyOneTimePasswordService(body: VerifyOtpDto) {
    try {
      // get userDetails And Latest OTP
      const userDetail = await this.userRepository.findOne({
        where: { email: body.email },
        relations: {
          otp: {
            user: true,
          },
        },
        order: {
          otp: {
            createdDate: 'DESC',
          },
        },
      });

      if (userDetail) {
        if (body.password !== body.confirmPassword) {
          throw new UnauthorizedException('Password doest match');
        }

        // check the otp and hashed otp
        const compareOtp = await this.comparePassword(
          body.otp,
          userDetail?.otp[0]?.otp,
        );

        if (compareOtp) {
          // now we need to hash the password
          const hashPassword = await this.hashPassword(body.password);

          // now we need to update the password
          await this.userRepository.update(
            { email: body.email },
            { password: hashPassword },
          );

          return sentBackResponse<{ message: string; email: string }>(
            {
              message: HttpResponseMessages.resetPasswordSuccess,
              email: body.email,
            },
            HttpStatus.CREATED,
          );
        }

        throw new UnauthorizedException(HttpResponseFailedMessages.invalidUser);
      }

      // if user not exist throw error
      throw new UnauthorizedException(HttpResponseFailedMessages.invalidUser);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(error.message, error.stack);
      } else {
        this.logger.warn('unknow error');
      }

      throw error;
    }
  }

  async oAuthSign(req: RequestWithUser) {
    try {
      const { email, firstName, lastName, picture, provider } = req.user;

      // Check if the google user is already exist or not
      let getuserDetails = await this.userRepository.findOne({
        where: { email },
      });

      // if the user is already exist
      if (!getuserDetails) {
        // Need to create the user
        const createUser = this.userRepository.create({
          email,
          fullName: `${firstName ?? ''} ${lastName ?? ''}`,
          provider: provider,
          profilePicture: picture,
        });

        // here i am gone save the user to my database
        getuserDetails = await this.userRepository.save(createUser);
      }

      // here i am gone generate a jwt token
      const jwtToken = await this.generateJwtToken({
        id: getuserDetails.id,
        email,
      });

      return sentBackResponse<{
        data: createAccountData;
        message: string;
      }>(
        {
          data: { email, token: jwtToken, userName: getuserDetails.userName },
          message: HttpResponseMessages.userVerification,
        },
        HttpStatus.ACCEPTED,
      );
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`${error.message} OAuth SignIn Method`, error.stack);
      } else {
        this.logger.warn('unknow Error at Google SignIn Method');
      }

      throw error;
    }
  }

  // Hash Password utility
  async hashPassword(plainPassword: string) {
    try {
      // generating the salt
      const generatedSalt = await bcrypt.genSalt(11);

      // Hashing the plain password
      const hashedPassword = await bcrypt.hash(plainPassword, generatedSalt);
      return hashedPassword;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(error.message, error.stack);
      } else {
        this.logger.error('Hash Password Failed');
      }

      throw error;
    }
  }

  async generateJwtToken(user: { id: number; email: string }) {
    try {
      // here gone generate the jwt token
      const payload = {
        userId: user.id,
        email: user.email,
      };

      // jwt token
      return await this.jwtService.signAsync(payload);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(error.message, error.stack);
      } else {
        this.logger.error('Hash Password Failed');
      }

      throw error;
    }
  }

  async comparePassword(password: string, hashedPassword: string) {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.warn(
          `${error.message} In Compare Password Method`,
          error.stack,
        );
      } else {
        this.logger.warn('unknow error in compare password method');
      }

      throw error;
    }
  }
}

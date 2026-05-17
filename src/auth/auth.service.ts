import bcrypt from 'bcryptjs';

import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { LoggerService } from 'src/common/logger/logger.service';
import { JwtService } from '@nestjs/jwt';
import {
  HttpResponseMessages,
  sentBackResponse,
} from 'src/common/util/constant';
import type { RequestWithUser, UserSignin } from './types/user.types';

@Injectable()
export class AuthService {
  // properties
  private readonly logger = new LoggerService();

  // Class constructor
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
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

        return sentBackResponse<{
          email: string;
          userName: string;
          token: string;
        }>(responsePayload, 'User Created Successful', HttpStatus.CREATED);
      }

      // if user already exist will throw this below error
      throw new UnauthorizedException('user already exist');
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
      const getUser = await this.userRepository.findOne({ where: { email } });

      // invalid error
      if (!getUser) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // here need to compare the password
      const isPasswordCorrect = await this.comparePassword(
        password,
        getUser.password,
      );

      if (!isPasswordCorrect) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // need to generate the jwt
      const jwtPayload = {
        id: getUser.id,
        email,
      };
      const generatedJwt = await this.generateJwtToken(jwtPayload);

      // sent back response
      return sentBackResponse<{ email: string; jwtToken: string }>(
        {
          email: email,
          jwtToken: generatedJwt,
        },
        'User verification successful',
        HttpStatus.ACCEPTED,
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
        jwtToken: string;
        email: string;
      }>(
        { jwtToken, email },
        HttpResponseMessages.userVerification,
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

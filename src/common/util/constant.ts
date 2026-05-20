export function sentBackResponse<DataType>(
  data: DataType,
  statusCode: number,
  isSuccessResponse = true,
) {
  return {
    statusCode,
    data,
    isSuccessResponse,
  };
}

export const HttpResponseMessages = {
  userVerification: 'User verification successfull',
  sentEmailSuccess: 'Email sent Successfull',
  resetPasswordSuccess: 'Reset password successfull',
};

export const HttpResponseFailedMessages = {
  invalidUser: 'Invalid credentials',
  userExist: 'user Already Exist',
  somethingWentWrong: 'Something went wrong',
  failedToSentEmail: 'Failed to sent email',
};

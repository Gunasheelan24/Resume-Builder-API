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
  userVerification: 'User Verification Successfull',
};

export const HttpResponseFailedMessages = {
  invalidUser: 'Invalid credentials',
  userExist: 'user Already Exist',
};

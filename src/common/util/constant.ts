export function sentBackResponse<DataType>(
  data: DataType,
  message: string,
  statusCode: number,
  isSuccessResponse = true,
) {
  return {
    message,
    statusCode,
    data,
    isSuccessResponse,
  };
}

export const HttpResponseMessages = {
  userVerification: 'User Verification Successfull',
};

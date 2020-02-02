class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    // call parent

    // custom status code
    this.statusCode = statusCode;
  }
}

module.exports = ErrorResponse;

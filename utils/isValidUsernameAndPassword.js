// fetch SOAP IsValidUsernameAndPassword
const soapRequest = require('easy-soap-request');
const xml2js = require('xml2js');

const isValidUsernameAndPassword = async (username, password) => {
  const url = process.env.ISVALID_USERNAME_URL;
  const Headers = {
    'Content-Type': 'text/xml;charset=UTF-8',
    soapAction: process.env.ISVALIDUSERNAME_SOAP_ACTION
  };

  const xml = `
  <Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/">
      <Body>
          <IsValidUsernameAndPassword xmlns="http://idm.pea.co.th/">
              <!-- Optional -->
              <request>
                  <WSAuthenKey>${process.env.ISVALIDUSERNAME_KEY}</WSAuthenKey>
                  <!-- Optional -->
                  <InputObject>
                      <Username>${username}</Username>
                      <Password>${password}</Password>
                      <Applicationid>${process.env.APPLICATION_ID}</Applicationid>
                  </InputObject>
              </request>
          </IsValidUsernameAndPassword>
      </Body>
  </Envelope>
  `;

  const { response } = await soapRequest({
    url: url,
    headers: Headers,
    xml: xml,
    timeout: 1000
  }); // Optional timeout parameter(milliseconds)

  const { headers, body, statusCode } = response;

  // parse to JSON object
  const options = {
    explicitArray: false,
    tagNameProcessors: [xml2js.processors.stripPrefix]
  };

  const result = await xml2js.parseStringPromise(body, options);

  const {
    RefId,
    ResponseCode,
    ResponseMsg,
    ResultObject
  } = result.Envelope.Body.IsValidUsernameAndPasswordResponse.IsValidUsernameAndPasswordResult;

  const data = ResultObject == 'true';

  return data;
};

module.exports = isValidUsernameAndPassword;

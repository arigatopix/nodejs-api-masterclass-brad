// fetch SOAP Employee Info
const soapRequest = require('easy-soap-request');
const xml2js = require('xml2js');
const dotenv = require('dotenv');

dotenv.config({ path: './config/config.env' });

const employeeInfo = async () => {
  const url = 'https://idm.pea.co.th/webservices/EmployeeServices.asmx?wsdl';
  const Headers = {
    'Content-Type': 'text/xml;charset=UTF-8',
    soapAction: 'http://idm.pea.co.th/GetEmployeeInfoByUsername'
  };

  const xml = `
  <Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/">
    <Body>
        <GetEmployeeInfoByUsername xmlns="http://idm.pea.co.th/">
            <!-- Optional -->
            <request>
                <WSAuthenKey>d97ba214-2e66-465f-a1f8-9f5b479fdcad</WSAuthenKey>
                <!-- Optional -->
                <InputObject>
                    <Username>503015</Username>
                </InputObject>
            </request>
        </GetEmployeeInfoByUsername>
    </Body>
</Envelope>`;

  try {
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
    const resultObject =
      result.Envelope.Body.GetEmployeeInfoByUsernameResponse
        .GetEmployeeInfoByUsernameResult.ResultObject;

    if (resultObject == 'true') {
      console.log('True');
    }
  } catch (err) {
    console.log(err);
  }
};

employeeInfo();

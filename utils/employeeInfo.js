// fetch SOAP Employee Info
const soapRequest = require('easy-soap-request');
const xml2js = require('xml2js');

const employeeInfo = async username => {
  const url = process.env.EMPLOYEE_INFO_URL;
  const Headers = {
    'Content-Type': 'text/xml;charset=UTF-8',
    soapAction: process.env.EMPLOYEE_INFO_SOAP_ACTION
  };

  const xml = `
  <Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/">
    <Body>
        <GetEmployeeInfoByUsername xmlns="http://idm.pea.co.th/">
            <!-- Optional -->
            <request>
                <WSAuthenKey>${process.env.EMPLOYEE_INFO_KEY}</WSAuthenKey>
                <!-- Optional -->
                <InputObject>
                    <Username>${username}</Username>
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

    const {
      Username,
      TitleFullName,
      FirstName,
      LastName,
      DepartmentSap,
      Email,
      NewOrganizationalCode,
      BaCode,
      Peacode,
      Peaname,
      Peaname1
    } = result.Envelope.Body.GetEmployeeInfoByUsernameResponse.GetEmployeeInfoByUsernameResult.ResultObject;

    const data = {
      employeeId: Username,
      titleFullName: TitleFullName,
      firstName: FirstName,
      lastName: LastName,
      departmentSap: DepartmentSap,
      email: Email,
      newOrganizationalCode: NewOrganizationalCode,
      baCode: BaCode,
      peaCode: Peacode,
      peaName: Peaname,
      peaFullName: Peaname1
    };

    return data;
  } catch (err) {
    console.log(err);
  }
};

module.exports = employeeInfo;

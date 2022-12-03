const AWS = require('aws-sdk')
const { v4: uuidv4 } = require('uuid');
const cognito = new AWS.CognitoIdentityServiceProvider()

exports.handler = async (event) => {
    let regRes = {
        message:'',
        statusCode:'',
        userAttributesRes: {},
    }
    // TODO implement
    if(!event.body){
        regRes.message = 'No input body provided!';
        regRes.statusCode = 400;
        return regRes;
    }
    const {email, password} = event.body;
    if((!email && email !== "") || (!password && password !== "")){
        regRes.message = 'Invalid input body!';
        regRes.statusCode = 400;
        return regRes;
    }
    
    
    const params = {
      UserPoolId: 'us-east-1_gHxRD0NZX',
      Username: email,
      UserAttributes: [{
          Name: 'email',
          Value: email
        },
        {
          Name: 'email_verified',
          Value: 'true'
        },
        {
         Name: 'custom:orgId',
         Value: uuidv4()
        }
      ],
      MessageAction: 'SUPPRESS'
    }
const response = await cognito.adminCreateUser(params).promise();
console.log(response, "adminCreateUser response...")
response.User.Attributes.map(att=>{
    const keys = Object.keys(att);
    let prevKey = att[keys[0]];
    keys.map((k)=>{
        if(k === "Name"){
            prevKey = att["Name"];
            regRes.userAttributesRes[prevKey] = null;
            
        }else if(k === "Value"){
            regRes.userAttributesRes[prevKey] = att[k];
        }
    })
})

if (response.User) {
  const paramsForSetPass = {
    Password: password,
    UserPoolId: 'us-east-1_gHxRD0NZX',
    Username: email,
    Permanent: true
  };
  const passSetRes = await cognito.adminSetUserPassword(paramsForSetPass).promise()
  console.log(passSetRes, "adminsetUserPass response...")
  if(passSetRes){
      regRes.message = 'User registered successfully';
      regRes.statusCode = 200;
  }
}
    return regRes;
};

const AWS = require("aws-sdk");
const ULID = require('ulid')
const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();

//callerContext: {
//awsSdkVersion: 'aws-sdk-unknown-unknown',
//clientId: '6if9s79d9f0587hqalqqidf15l'
//}

exports.handler = async (event, context, callback) => {
  console.log(event, callback);
  const orgId = ULID.ulid();
//   const cognitoCallParams = {
//     UserPoolId: event.userPoolId,
//     Username: event.userName,
//   };
//   const dynamoReadParams = {
//     TableName: "BizContactPro",
//     KeyConditionExpression: "PK = :pkey ",
//     ExpressionAttributeValues: {
//       ":pkey": "TemplateUserID#*",
//     },
//   };
  try {
    // const cognitoRes = await cognitoidentityserviceprovider
    //   .adminAddUserToGroup(cognitoCallParams)
    //   .promise();
    // console.log(cognitoRes);

    const cognitoUpdateParams = {
      UserAttributes: [
        {
          Name: "custom:orgId",
          Value: orgId,
        },
      ],
      UserPoolId: event.userPoolId,
      Username: event.userName,
    };

    const userUptRes = await cognitoidentityserviceprovider
      .adminUpdateUserAttributes(cognitoUpdateParams)
      .promise();

    // const dynamoReadRes = await dynamoClient.query(dynamoReadParams).promise();

    console.log(userUptRes, 'user updation result');
    // for (const i in dynamoReadRes.Items) {
    //   const dynamoPutRes = await dynamoClient
    //     .put({
    //       TableName: "BizContactPro",
    //       Item: {
    //         ...dynamoReadRes.Items[i],
    //         PK: `TemplateUserID#${event.userName}`,
    //       },
    //     })
    //     .promise();
    //   console.log(dynamoPutRes);
    // }

    callback(null, event);
  } catch (error) {
    console.log(error, error.stack);
    callback(error, event);
  }
};

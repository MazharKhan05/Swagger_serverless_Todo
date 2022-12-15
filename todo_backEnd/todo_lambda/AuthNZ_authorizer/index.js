const jwt = require("jsonwebtoken");
const jwkToPem = require("jwk-to-pem");
const request = require("request");
const DynamoDB = require("aws-sdk/clients/dynamodb");
const jwt_decode = require("jwt-decode");

// const userPoolId = "us-east-1_ozUSrzGAA"; // Cognito user pool id here

const dynamoClient = new DynamoDB.DocumentClient();
exports.handler = async function (event, context, callback) {
//   console.log(event.headers);

//   const {httpMethod: method, resource, headers: {Authorization, orgid}} = event;
  const {authToken} = event;
  console.log(event);
  const token = authToken;
  // return callback(null, generatePolicy("user", "Deny", event.methodArn));
      
  // const [_, __, method, ...resourceArr] = event.methodArn.split("/");
  // const resource = "/" + resourceArr.join("/");
  // console.log(resource, method);

  try {
    // const authorizerHandler = new AuthorizerHandler;
    // await authorizerHandler.updateData(dynamoClient);
    // console.log(authorizerHandler.resourceData, authorizerHandler.orgsData);

    const payload = await ValidateToken(token);
    
    const userID = payload['cognito:username'];   // grab userId from token for future uses
    const orgID = payload['custom:orgId'];    // grab organizationId from token for future uses
    const todoId = event.todoId;
    
    // const userPoolID = payload.iss.split(".com/")[1];
    
    // const groupID = (await dynamoClient.get({
    //   TableName : 'AuthNZ',
    //   Key: {
    //     PK: `UserID#${userID}`,
    //     SK: `OrgID#${orgid}`
    //   }
    // }).promise()).Item?.GroupID || '*';
    if (!todoId && payload && userID && userID !== "") {
      console.log("GOOOO");
      return callback(
        null,
        generatePolicy("user", "Allow", event.methodArn, payload, orgID)
      );
    } 
    const results = await dynamoClient.query({
      TableName: 'TodosList',
      FilterExpression : '#PK = :PK and begins_with(#SK, :SK)',
      ExpressionAttributeNames: {
          "#PK": "PK",
          "#SK": "SK"
      },
      ExpressionAttributeValues: {
          ':PK': {'S': `${orgID}:${userID}`},
          ':SK': {'S': `TodoId#${todoId}:State#`} //TodoId#01GM34VCTRFNQJ18X36MERWNSC:State#pending
      }
    })
    
    // console.log(groupID);
    console.log(userID);
    // console.log(userPoolID);
    // return callback(null, generatePolicy("user", "Deny", event.methodArn));
    // console.log(accountRole);
    // return callback(null, generatePolicy("user", "Deny", event.methodArn));

    if (results.$metadata && results.$metadata.httpStatusCode === 200 && results.Items > 0) {
      console.log("GOOOO");
      return callback(
        null,
        generatePolicy("user", "Allow", event.methodArn, payload, orgID)
      );
    } else {
      console.log("STOPPP");
      const check = generatePolicy("user", "Deny", event.methodArn);
      console.log(check);
      return callback(
        null,
        generatePolicy("user", "Deny", event.methodArn)
      );
    }
  } catch (error) {
    console.log(error);
    return callback(error);
  }
};

// Help function to generate an IAM policy
const generatePolicy = (principalId, effect, resource, payload, OrgID) => {
  console.log(principalId, effect, resource, payload);
  var authResponse = {};

  authResponse.principalId = principalId;
  if (effect && resource) {
    var policyDocument = {};
    policyDocument.Version = "2012-10-17";
    policyDocument.Statement = [];
    var statementOne = {};
    statementOne.Action = "execute-api:Invoke";
    statementOne.Effect = effect;
    statementOne.Resource = resource;
    policyDocument.Statement[0] = statementOne;
    authResponse.policyDocument = policyDocument;
  }
  console.log(authResponse);
  // Optional output with custom properties of the String, Number or Boolean type.
  authResponse.context = {
    stringKey: JSON.stringify({...payload, OrgID}),
  };
  return authResponse;
};

const ValidateToken = (token) => {
  const decodedToken = jwt_decode(token);
  return new Promise((resolve, reject) => {
    console.log("Validating the token...");
    request(
      {
        url: `${decodedToken.iss}/.well-known/jwks.json`,
        json: true,
      },
      (error, response, body) => {
        console.log("validation token..");
        if (!error && response.statusCode === 200) {
          pems = {};
          var keys = body["keys"];
          for (var i = 0; i < keys.length; i++) {
            //Convert each key to PEM
            var key_id = keys[i].kid;
            var modulus = keys[i].n;
            var exponent = keys[i].e;
            var key_type = keys[i].kty;
            var jwk = { kty: key_type, n: modulus, e: exponent };
            var pem = jwkToPem(jwk);
            pems[key_id] = pem;
          }
          //validate the token
          var decodedJwt = jwt.decode(token, { complete: true });
          if (!decodedJwt) {
            console.log("Not a valid JWT token");
            return reject("Not a valid JWT token");
          }

          var kid = decodedJwt.header.kid;
          var pem = pems[kid];
          if (!pem) {
            console.log("Invalid token");
            return reject("Invalid token");
          }

          jwt.verify(token, pem, function (err, payload) {
            if (err) {
              console.log("Invalid Token.");
              return reject("Unauthorized");
            } else {
              console.log("Valid Token.");
              console.log(payload);
              return resolve(payload);
            }
          });
        } else {
          console.log(error);
          console.log("Error! Unable to download JWKs");
          return reject("Error! Unable to download JWKs");
        }
      }
    );
  });
};

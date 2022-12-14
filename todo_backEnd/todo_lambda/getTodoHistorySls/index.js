/**
 *  This code was generated by SwaggerHub from the following API:
 * 
 *  https://app.swaggerhub.com/api/KHANMAZHAR72/todo/1.0.0
 *  
 *  The content of this file will never be modified after initial
 *  generation--adding or changing parameters will not be reflected
 *  here.  You can regenerate this with the latest definition by
 *  deleting the lambda and allowing SwaggerHub to recreate it
 **/
const { DynamoDBClient,ScanCommand } = require('@aws-sdk/client-dynamodb');
const REGION = `us-east-1`; // Put your correct aws region
const ddbClient = new DynamoDBClient({ region: REGION });
exports.handler = async function(event, context, callback) {
  let response={
    message: '',
    errType: '',
    statusCode: null,
    historyTodos: []
  };
  const authToken = event.authToken; 
  const todoId = event.todoId;

  const actionPerformerOrgId = 'OrgID#98765'
  const actionPerformerUserId = 'UserID#12345'
  
  if(!authToken || authToken === ""){
    response.message = 'Not a Authenticated user.';
    response.statusCode = 401;
    return response;
  }
  if(!todoId){
    response.message = 'Invalid input provided.';
    response.statusCode = 400;
    return response;
  }
   const params = {
    TableName: 'TodosList',
    FilterExpression : '#PK = :PK and begins_with(#SK, :SK)',
    ExpressionAttributeNames: {
        "#PK": "PK",
        "#SK": "SK"
    },
    ExpressionAttributeValues: {
        ':PK': {'S': `${actionPerformerOrgId}:${actionPerformerUserId}`},
        ':SK': {'S': `TodoId#${todoId}:State#`} //TodoId#01GM34VCTRFNQJ18X36MERWNSC:State#pending
    }
  };
  // const params = {
  //   TableName: 'TodosList',
  //   FilterExpression : "not contains(#tu1, :tu2)",
  //   ExpressionAttributeNames: {
  //       "#timestamp": "timestamp",
  //       "#tu1": "taggedUsers"
  //   },
  //   ExpressionAttributeValues: {
  //       ":ac": "true",
  //       ":from": 1632919324385,
  //       ":to": Date.now(),
  //       ":tu2": userId
  //   },
  //   KeyConditionExpression : 'PK = :PK and begins_with ( SK , :SK )',
  //   ExpressionAttributeValues: {
  //       ':PK': {'S': `${actionPerformerOrgId}:${actionPerformerUserId}`},
  //       ':SK': {'S': `TodoId#${id}:State#pending`}
  //   }
  // };
  try {
    let tempTodo =[]
    const data = await ddbClient.send(new ScanCommand(params));
    console.log(data);
    if(data.$metadata && data.$metadata.httpStatusCode === 200){
      response.message = 'Todo history fetched successfully'
      // response.todos = data.Items;
      response.statusCode = data.$metadata.httpStatusCode;
      data.Items.map((item)=>{
        let keys = Object.keys(item);
        const keysLen = keys.length;
        const newTodo = {};
        console.log(keys, "keys of a todo...")
        for(let i=0;i<keys.length;i++){
          const val = item[keys[i]].S;
          newTodo[keys[i]] = val;
        }
        console.log(newTodo, "newTodo after filteration")
        response.historyTodos.push(newTodo);
      })
    }
    } catch (err) {
      response.message = err.errorMessage;
      response.errType = err.errorType;
      response.statusCode = 500;
      return response;
    }
    return response;
};
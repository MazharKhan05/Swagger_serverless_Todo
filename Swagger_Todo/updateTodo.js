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

const { DynamoDBClient,PutItemCommand,GetItemCommand } = require('@aws-sdk/client-dynamodb');
const { v4: uuidv4 } = require('uuid');
const REGION = `us-east-1`; // Put your correct aws region
const ddbClient = new DynamoDBClient({ region: REGION });
exports.handler = async function(event, context, callback) {
  // header: (required)  login-token to authorize user
  // var auth-token = event.auth-token;
  // path: (required)  ID of todo to update
  
  const parsedEvent = event.body;
  const parsedtodoId = event.todoId;
  console.log("lambda evnt-body vars, ", parsedEvent);
  // const id = event.queryStringParameters.todoId;
  const id = parsedtodoId;
  // const name = event["name"];
  // const status = event["status"];
  const {name, status} = parsedEvent;
  console.log("event body", name, status);
  const currDateTime = new Date();
  const DateTimeFormat = currDateTime.toISOString();
  const stateId = uuidv4();
  let isStateSet = false
  let updatedTodo;
  
  let response={
    todoStateMsg: '',
    todoOrgMsg: '',
    statusCode: null
  };
  let targetTodo = {};
  
  
  if(!id){
    response.message = 'Invalid input provided.';
    return response;
  }
  if(name === ""){
    response.message = 'Invalid input provided.';
    return response;
  }
  const getTodoParams = {
    TableName: "todoOrg",
    Key: {
      todoId: {S:`${id}`},
    }
  };
  
  let paramsState = {
    TableName: 'todoState',
    Item: {
      stateId: {S:`${stateId}`},
      state: {S:`${status}`},
      stateChangeTime : {S:`${DateTimeFormat}`},
    },
   };
  try {
    const data = await ddbClient.send(new GetItemCommand(getTodoParams));
    console.log(data);
    if(data.$metadata && data.$metadata.httpStatusCode === 200){
      isStateSet = true
      targetTodo = data.Item;

      if(isStateSet && status && status !== ""){
        paramsState.Item.stateId.S = data.Item.stateId.S;
        try {
          const data = await ddbClient.send(new PutItemCommand(paramsState));
          if(data.$metadata && data.$metadata.httpStatusCode === 200){
            response.todoStateMsg = 'Successfully updated todoState';
            response.statusCode = 200;
          }
        } catch (err) {
          response = err
          console.error(err);
        }
      }
    }
    } catch (err) {
      response = err
      console.error(err);
    }
  
  const paramsTodo = {
    TableName: 'todoOrg',
    Item: {
      todoId: {S:`${targetTodo.todoId.S}`},
      name: {S:`${name}`},
      orgId: {S:"54321"},
      stateId : {S:`${targetTodo.stateId.S}`},
    },
  };
  try {
    if(name && name !== ""){
      const data = await ddbClient.send(new PutItemCommand(paramsTodo));
      if(data.$metadata && data.$metadata.httpStatusCode === 200){
        response.todoOrgMsg = 'Successfully updated todoOrg';
        response.statusCode = 200;
      }      
    }
  } catch (err) {
      console.error(err);
      return err;
    }
    
    try {
        updatedTodo = await ddbClient.send(new GetItemCommand({
        TableName: "todoOrg",
        Key: {
            todoId: {S:`${targetTodo.todoId.S}`},
            }
        }));
        console.log(updatedTodo, "updatedTodo here...");
        } catch (err) {
            console.log(err, "err");
            return err;
        }
    if(response.statusCode === 200){
      return updatedTodo.Item;
    }
    return response;
};
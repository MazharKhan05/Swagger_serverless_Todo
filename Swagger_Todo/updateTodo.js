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
  const actionPerformerOrgId = 'OrgID#98765'
  const actionPerformerUserId = 'UserID#12345'
  let updatedTodo={};
  const newTodo = {};
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
  if(name === "" || status === ""){
    response.message = 'Invalid input provided.';
    return response;
  }
  const getTodoParams = {
    TableName: "TodosList",
    Item: {
      PK: {S: `${actionPerformerOrgId}:${actionPerformerUserId}`},
      SK: {S: `TodoId#${id}`},
      Name: {S: `${name}`},
      State: {S:`${status}`},
      time: {S:`${DateTimeFormat}`}
    }
  };
  const getTodo = {
    TableName: "TodosList",
    Key: {
      PK: {S: `${actionPerformerOrgId}:${actionPerformerUserId}`},
      SK: {S:`TodoId#${id}`}
    }
  };
  
  try {
    const data = await ddbClient.send(new GetItemCommand(getTodo));
    console.log(data, "record to be updated...");
    if(data.$metadata && data.$metadata.httpStatusCode === 200){
      isStateSet = true
      targetTodo = data.Item;

      if(isStateSet){
        
        const todoState = (status && status !== "") ? status : targetTodo.State.S;
        const todoName = (name === "" || !name) ? targetTodo.Name.S : name;
        getTodoParams.Item.State.S = todoState;
        getTodoParams.Item.Name.S = todoName;
        const prevSK = targetTodo.SK.S;
        getTodoParams.Item.SK.S = `${prevSK}:State#${todoState}`;
        console.log(getTodoParams, "params to be updated...")
        try {
          const data = await ddbClient.send(new PutItemCommand(getTodoParams));
          console.log("updation result,", data)
          if(data && data.$metadata && data.$metadata.httpStatusCode === 200){
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

    try {
        const todoState = (status && status !== "") ? status : targetTodo.State.S;
      
        updatedTodo = await ddbClient.send(new GetItemCommand({
        TableName: "TodosList",
        Key: {
            PK: {S: `${actionPerformerOrgId}:${actionPerformerUserId}`},
            SK: {S:`TodoId#${id}:State#${todoState}`},
            }
        }));
        console.log(updatedTodo, "updatedTodo here...");
        
        let keys = Object.keys(updatedTodo.Item);
        
        for(let i=0;i<keys.length;i++){
          const val = updatedTodo.Item[keys[i]].S;
          newTodo[keys[i]] = val;
        }
        } catch (err) {
            console.log(err, "err");
            return err;
        }
        
    if(response.statusCode === 200){
      return newTodo;
    }
    return response;
};
import React, { useState } from 'react';
import  Form  from 'react-bootstrap/Form';
import { AllTodosFetchedTodos, TodoApi, UpdateTodo} from '../typescript_client_latest/api'
import { useCookies } from 'react-cookie'
import {FormatedTodo} from './Todos'
interface Props{
    setIsChanged : (isChanged: boolean)=> void,
    showUptForm: boolean,
    setShowUptForm: (showUptForm: boolean)=> void,
    todo: FormatedTodo,
    show: boolean,
    setShow: (show:boolean)=> void,
    alertMsg: string,
    setAlertMsg: (alertMsg:string)=>void
}
const Updatetodo: React.FC <Props>= ({ setIsChanged, showUptForm, setShowUptForm, todo, show, setShow, alertMsg, setAlertMsg}) => {
    const [todoName, setTodoName] = useState<string>("");
    const [todoStatus, setTodoStatus] = useState<string>("");
    const [cookies, setCookie] = useCookies(['id_token','access_token', 'refresh_token', 'email', 'userId'])
    
    const handleUpdation = ()=>{
        let body:UpdateTodo = {
            name: '',
            status: ''
        }
        const todoIdStr:string = todo.SK?.substring(7, 33)!
        console.log(todoIdStr) 
        const todoApiObj = new TodoApi();
        body.name = todoName;
        body.status = todoStatus;
        if(body.name != "" || body.status != "" && todoIdStr && todoIdStr != ""){
            const res = todoApiObj.updateTodo(cookies.id_token, todoIdStr, body);
            res.then(uptRes=>{
                console.log(uptRes, "res from addTodo endpoint...")
                if(uptRes.errType != '' && uptRes.statusCode != 200){
                    setAlertMsg(uptRes.message);
                    setShow(true);
                }
                setIsChanged(true)
                setAlertMsg(uptRes.message);
                setShow(true);
                setShowUptForm(false);
            }).catch(err=>{
                if(err.status === 403){
                    setAlertMsg('Action forbidden!!')
                    setShow(true)
                }else if(err.status === 401 ){
                    setAlertMsg('User unauthorized!')
                    setShow(true)
                }
                console.log(err)
            })
        }else{
            setShow(true)
            setAlertMsg('Please enter a valid input!!!')
        }
    }
return (
    <div>
        <p>Update Todo.</p>
        {showUptForm ? 
                <Form>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Todo name</Form.Label>
                        <Form.Control size='sm' type="text" name="name" placeholder="Enter name" onChange={(e)=>setTodoName(e.target.value)}/>
                        <Form.Label>Todo state</Form.Label>
                        <Form.Control size='sm' type="text" name="state" placeholder="Enter state" onChange={(e)=>setTodoStatus(e.target.value)}/>
                    </Form.Group>

                    <button className='rounded-md border border-transparent py-2 px-2 text-sm font-bold text-white bg-blue-500 hover:bg-blue-600 focus:ring-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2' onClick={(e)=>{e.preventDefault(); handleUpdation()}}>
                        Update Todo
                    </button>
                 </Form>
        : <></>}
        
    </div>
);
}

export default Updatetodo;

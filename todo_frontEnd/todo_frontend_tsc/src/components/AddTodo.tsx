import React, { ChangeEvent, useEffect, useState } from "react";
import Form from "react-bootstrap/Form";
import { useCookies } from "react-cookie";
import {
  AllTodosFetchedTodos,
  TodoApi,
  PostTodo,
} from "../typescript_client_latest/api";

interface Props {
  isChanged: boolean;
  setIsChanged: (isChanged: boolean) => void;
  show: boolean;
  setShow: (show: boolean) => void;
  alertMsg: string;
  setAlertMsg: (alertMsg: string) => void;
}
const AddTodo: React.FC<Props> = ({
  isChanged,
  setIsChanged,
  show,
  setShow,
  alertMsg,
  setAlertMsg,
}) => {
  const [todoName, setTodoName] = useState<string>("");
  const [cookies, setCookie] = useCookies([
    "id_token",
    "access_token",
    "refresh_token",
    "email",
    "userId",
  ]);
  const access_token =
    "eyJraWQiOiI5UkFrYWg0UForWEwrRWY0T1wvTGFDRzB3NmpIXC9OYm53YUVwaXV6RXpLU0E9IiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiJkOTYxYTkxMy1mZThmLTQ5OWItYmZhMy0xNTgyNDEwNzM3YzAiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV9nSHhSRDBOWlgiLCJ2ZXJzaW9uIjoyLCJjbGllbnRfaWQiOiIycmIybGZ1OTNodnV0YXZhOHJhMWhvMGltYiIsIm9yaWdpbl9qdGkiOiIxYmQwZTFlMy0wZDFkLTRjYmItODc2MC01MjMzMDVkZTVmZDciLCJldmVudF9pZCI6IjM3ZGIzYTlkLTE2NjktNDViMi1iNTIwLTEzMTVmODBhODQyYyIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiYXdzLmNvZ25pdG8uc2lnbmluLnVzZXIuYWRtaW4gb3BlbmlkIHByb2ZpbGUgZW1haWwiLCJhdXRoX3RpbWUiOjE2NzA1MDg4NzcsImV4cCI6MTY3MDUxMjQ3NywiaWF0IjoxNjcwNTA4ODc3LCJqdGkiOiIyYWYwNjJkOC01MTdkLTQyMWYtYTgzYS00OWRkMjM1N2FhOGEiLCJ1c2VybmFtZSI6ImQ5NjFhOTEzLWZlOGYtNDk5Yi1iZmEzLTE1ODI0MTA3MzdjMCJ9.VMJ1Vlis7wYklAzLOlou4fpWWezruN8ziaUmDGTICYWie5WBp9tQeRLJ915NkebWEcPis-YYUA74qbN5yjd3mOsWkvWkgLmhfzz53rpx63aOlUTf72gsYGt8nqYmGt9GgdCP8bpxYj1Fb7y_eHD-7uiCbpQ4G5dtIyvXrlMvpn-EOsjB4sRddDNKeI0GLkKEoeCxxSkK8aLO_PSF1M8sPO5YJDfOjt4H77ZWy5X-2BLlk08tvDCAFBBCjNBQE_lrBh7lK7o49pxrqt7A8iyqQXqjjBoYWJTkmX0dcyRsITPnTS7Mb2qGIIOia09BEm2AKb0qGPVSpX85-tTKE-620A";
  const [resTodos, setResTodos] = useState<Array<AllTodosFetchedTodos>>([]);

  const handleSubmit = () => {
    setShow(show ? false : show);
    let body: PostTodo = {
      Name: "",
    };
    const todoApiObj = new TodoApi();
    body.Name = todoName;
    if (body.Name != "") {
      const res = todoApiObj.addTodo(body, cookies.id_token);
      res
        .then((addRes) => {
          console.log(addRes, "res from addTodo endpoint...");
          if (addRes.statusCode != 200) {
            setAlertMsg(addRes.message);
            setShow(true);
          }
          setIsChanged(true);
          setAlertMsg(addRes.message);
          setShow(true);
        })
        .catch((err) => {
          if (err.status === 403) {
            setAlertMsg("Action forbidden!!");
            setShow(true);
          } else if (err.status === 401) {
            setAlertMsg("User unauthorized!");
            setShow(true);
          }
          console.log(err, "error to process this request...");
        });
    } else {
      setShow(true);
      setAlertMsg("Please enter a valid input!!!");
    }
  };
  return (
    <div className="flex justify-content-center w-full">
      <Form className="w-2/3">
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Todo name</Form.Label>
          <Form.Control
            size="sm"
            type="text"
            name="name"
            placeholder="Enter name"
            onChange={(e) => setTodoName(e.target.value)}
          />
        </Form.Group>

        <button
          className="rounded-md border border-transparent py-2 px-2 text-sm font-bold text-white bg-blue-500 hover:bg-blue-600 focus:ring-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2"
          onClick={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          Add Todo
        </button>
      </Form>
    </div>
  );
};

export default AddTodo;

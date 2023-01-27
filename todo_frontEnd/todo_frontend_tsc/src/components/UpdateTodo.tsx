import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import {
  AllTodosFetchedTodos,
  TodoApi,
  UpdateTodo,
} from "../typescript_client_latest/api";
import { useCookies } from "react-cookie";
import { FormatedTodo } from "./Todos";
interface Props {
  setIsChanged: (isChanged: boolean) => void;
  showUptForm: boolean;
  setShowUptForm: (showUptForm: boolean) => void;
  todo: FormatedTodo;
  show: boolean;
  setShow: (show: boolean) => void;
  alertMsg: string;
  setAlertMsg: (alertMsg: string) => void;
}
const Updatetodo: React.FC<Props> = ({
  setIsChanged,
  showUptForm,
  setShowUptForm,
  todo,
  show,
  setShow,
  alertMsg,
  setAlertMsg,
}) => {
  const [todoName, setTodoName] = useState<string>("");
  const [todoStatus, setTodoStatus] = useState<string>("");
  const [cookies, setCookie] = useCookies([
    "id_token",
    "access_token",
    "refresh_token",
    "email",
    "userId",
  ]);
  const access_token =
    "eyJraWQiOiI5UkFrYWg0UForWEwrRWY0T1wvTGFDRzB3NmpIXC9OYm53YUVwaXV6RXpLU0E9IiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiJkOTYxYTkxMy1mZThmLTQ5OWItYmZhMy0xNTgyNDEwNzM3YzAiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV9nSHhSRDBOWlgiLCJ2ZXJzaW9uIjoyLCJjbGllbnRfaWQiOiIycmIybGZ1OTNodnV0YXZhOHJhMWhvMGltYiIsIm9yaWdpbl9qdGkiOiIxYmQwZTFlMy0wZDFkLTRjYmItODc2MC01MjMzMDVkZTVmZDciLCJldmVudF9pZCI6IjM3ZGIzYTlkLTE2NjktNDViMi1iNTIwLTEzMTVmODBhODQyYyIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiYXdzLmNvZ25pdG8uc2lnbmluLnVzZXIuYWRtaW4gb3BlbmlkIHByb2ZpbGUgZW1haWwiLCJhdXRoX3RpbWUiOjE2NzA1MDg4NzcsImV4cCI6MTY3MDUxMjQ3NywiaWF0IjoxNjcwNTA4ODc3LCJqdGkiOiIyYWYwNjJkOC01MTdkLTQyMWYtYTgzYS00OWRkMjM1N2FhOGEiLCJ1c2VybmFtZSI6ImQ5NjFhOTEzLWZlOGYtNDk5Yi1iZmEzLTE1ODI0MTA3MzdjMCJ9.VMJ1Vlis7wYklAzLOlou4fpWWezruN8ziaUmDGTICYWie5WBp9tQeRLJ915NkebWEcPis-YYUA74qbN5yjd3mOsWkvWkgLmhfzz53rpx63aOlUTf72gsYGt8nqYmGt9GgdCP8bpxYj1Fb7y_eHD-7uiCbpQ4G5dtIyvXrlMvpn-EOsjB4sRddDNKeI0GLkKEoeCxxSkK8aLO_PSF1M8sPO5YJDfOjt4H77ZWy5X-2BLlk08tvDCAFBBCjNBQE_lrBh7lK7o49pxrqt7A8iyqQXqjjBoYWJTkmX0dcyRsITPnTS7Mb2qGIIOia09BEm2AKb0qGPVSpX85-tTKE-620A";
  const handleUpdation = () => {
    let body: UpdateTodo = {
      Name: "",
      State: "",
    };
    const todoIdStr: string = todo.SK?.substring(7, 33)!;
    const todoApiObj = new TodoApi();
    body.Name = todoName;
    body.State = todoStatus;
    if (body.Name != "" || (body.State != "" && todoIdStr && todoIdStr != "")) {
      const res = todoApiObj.updateTodo(cookies.id_token, todoIdStr, body);
      res
        .then((uptRes) => {
          if (uptRes.statusCode != 200) {
            setAlertMsg(uptRes.message);
            setShow(true);
          }
          setIsChanged(true);
          setAlertMsg(uptRes.message);
          setShow(true);
          setShowUptForm(false);
        })
        .catch((err) => {
          if (err.status === 403) {
            setAlertMsg("Action forbidden!!");
            setShow(true);
          } else if (err.status === 401) {
            setAlertMsg("User unauthorized!");
            setShow(true);
          }
          console.log(err);
        });
    } else {
      setShow(true);
      setAlertMsg("Please enter a valid input!!!");
    }
  };
  return (
    <div>
      <p>Update Todo.</p>
      {showUptForm ? (
        <Form>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Todo name</Form.Label>
            <Form.Control
              size="sm"
              type="text"
              name="name"
              placeholder="Enter name"
              onChange={(e) => setTodoName(e.target.value)}
            />
            <Form.Label>Todo state</Form.Label>
            <Form.Control
              size="sm"
              type="text"
              name="state"
              placeholder="Enter state"
              onChange={(e) => setTodoStatus(e.target.value)}
            />
          </Form.Group>

          <button
            className="rounded-md border border-transparent py-2 px-2 text-sm font-bold text-white bg-blue-500 hover:bg-blue-600 focus:ring-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2"
            onClick={(e) => {
              e.preventDefault();
              handleUpdation();
            }}
          >
            Update Todo
          </button>
        </Form>
      ) : (
        <></>
      )}
    </div>
  );
};

export default Updatetodo;

import React, { useEffect, useState } from "react";
import { AllTodosFetchedTodos, TodoApi } from "../typescript_client_latest/api";
import { useCookies } from "react-cookie";
import Updatetodo from "./UpdateTodo";
import OptAlert from "./OptAlert";
import AddTodo from "./AddTodo";
import { CloseButton } from "react-bootstrap";
import { Navigate, useNavigate } from "react-router-dom";

interface Props {
  isChanged: boolean;
  setIsChanged: (isChanged: boolean) => void;
}
export interface FormatedTodo {
  PK: string;
  SK: string;
  Name: string;
  State: string;
  dateStr: string;
  timeStr: string;
}
let dtFormatedTodo = {
  PK: "",
  SK: "",
  Name: "",
  State: "",
  dateStr: "",
  timeStr: "",
};
const Todos: React.FC<Props> = ({ isChanged, setIsChanged }) => {
  const [resTodos, setResTodos] = useState<Array<FormatedTodo>>([]);
  const [resHistTodos, setResHistTodos] = useState<Array<FormatedTodo>>([]);
  const [uptTodo, setUptTodo] = useState<FormatedTodo>();
  const [showUptForm, setShowUptForm] = useState<boolean>(false);
  const [show, setShow] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [alertMsg, setAlertMsg] = useState<string>("");
  const [cookies, setCookie, removeCookie] = useCookies([
    "id_token",
    "access_token",
    "refresh_token",
    "email",
    "userId",
  ]);
  const navigate = useNavigate();
  const access_token =
    "eyJraWQiOiI5UkFrYWg0UForWEwrRWY0T1wvTGFDRzB3NmpIXC9OYm53YUVwaXV6RXpLU0E9IiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiJkOTYxYTkxMy1mZThmLTQ5OWItYmZhMy0xNTgyNDEwNzM3YzAiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV9nSHhSRDBOWlgiLCJ2ZXJzaW9uIjoyLCJjbGllbnRfaWQiOiIycmIybGZ1OTNodnV0YXZhOHJhMWhvMGltYiIsIm9yaWdpbl9qdGkiOiIxYmQwZTFlMy0wZDFkLTRjYmItODc2MC01MjMzMDVkZTVmZDciLCJldmVudF9pZCI6IjM3ZGIzYTlkLTE2NjktNDViMi1iNTIwLTEzMTVmODBhODQyYyIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiYXdzLmNvZ25pdG8uc2lnbmluLnVzZXIuYWRtaW4gb3BlbmlkIHByb2ZpbGUgZW1haWwiLCJhdXRoX3RpbWUiOjE2NzA1MDg4NzcsImV4cCI6MTY3MDUxMjQ3NywiaWF0IjoxNjcwNTA4ODc3LCJqdGkiOiIyYWYwNjJkOC01MTdkLTQyMWYtYTgzYS00OWRkMjM1N2FhOGEiLCJ1c2VybmFtZSI6ImQ5NjFhOTEzLWZlOGYtNDk5Yi1iZmEzLTE1ODI0MTA3MzdjMCJ9.VMJ1Vlis7wYklAzLOlou4fpWWezruN8ziaUmDGTICYWie5WBp9tQeRLJ915NkebWEcPis-YYUA74qbN5yjd3mOsWkvWkgLmhfzz53rpx63aOlUTf72gsYGt8nqYmGt9GgdCP8bpxYj1Fb7y_eHD-7uiCbpQ4G5dtIyvXrlMvpn-EOsjB4sRddDNKeI0GLkKEoeCxxSkK8aLO_PSF1M8sPO5YJDfOjt4H77ZWy5X-2BLlk08tvDCAFBBCjNBQE_lrBh7lK7o49pxrqt7A8iyqQXqjjBoYWJTkmX0dcyRsITPnTS7Mb2qGIIOia09BEm2AKb0qGPVSpX85-tTKE-620A";
  const formartDate = (todo: AllTodosFetchedTodos) => {
    const todoDate = new Date(todo.time!).getDate();
    const todoMonth = new Date(todo.time!).getMonth();
    const todoYear = new Date(todo.time!).getFullYear();
    const concatDate =
      String(todoDate) + "/" + String(todoMonth) + "/" + String(todoYear);

    const todoHour = new Date(todo.time!).getHours();
    const todoMinutes = new Date(todo.time!).getMinutes();
    const todoSeconds = new Date(todo.time!).getSeconds();
    const concatTime =
      String(todoHour) + ":" + String(todoMinutes) + ":" + String(todoSeconds);

    return `${concatDate}::${concatTime}`;
  };
  useEffect(() => {
    let dtFormatedTodos: Array<FormatedTodo> = [];
    if (isChanged && cookies.id_token !== "") {
      const newTodoApiObj = new TodoApi();
      const res = newTodoApiObj.getTodos(cookies.id_token);

      res
        .then((todos) => {
          if (todos.statusCode != 200) {
            setAlertMsg(todos.message);
            setShow(true);
          }
          const formatedTodos = todos.fetchedTodos?.map((todo) => {
            const formatedRes = formartDate(todo);
            const splitedRes = formatedRes.split("::");
            return {
              PK: todo.PK!,
              SK: todo.SK!,
              Name: todo.Name!,
              State: String(todo.State)!,
              dateStr: splitedRes[0]!,
              timeStr: splitedRes[1]!,
            };
          });
          setResTodos(formatedTodos!);
          setIsChanged(false);
        })
        .catch((err) => {
          if (err.status >= 500) setAlertMsg("Something went wrong!!");
          setShow(true);
        });
    }
  }, [isChanged]);
  const handleDelete = (todo: FormatedTodo) => {
    const todoIdStr = todo.SK?.substring(7, 33);

    const todoApiObj = new TodoApi();
    if (todoIdStr && todoIdStr != "") {
      const res = todoApiObj.deleteTodo(cookies.id_token, todoIdStr);
      res
        .then((delRes) => {
          if (delRes.statusCode != 200) {
            setAlertMsg(delRes.message);
            setShow(true);
          }
          setAlertMsg(delRes.message);
          setShow(true);
          setIsChanged(true);
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
    }
  };

  const handleTodoHisory = (todo: FormatedTodo) => {
    if (todo.SK === "" || !todo) {
      setAlertMsg("Invalid input, please try again.");
      setShow(true);
    }
    const todoIdStr = todo.SK?.substring(7, 33);

    const todoApiObj = new TodoApi();
    const res = todoApiObj.getTodoHistory(cookies.id_token, todoIdStr!);
    res
      .then((histTodos) => {
        if (histTodos.statusCode != 200) {
          setAlertMsg(histTodos.message);
          setShow(true);
        }

        const formatedTodos = histTodos.historyTodos?.map((todo) => {
          const formatedRes = formartDate(todo);
          const splitedRes = formatedRes.split("::");
          return {
            PK: todo.PK!,
            SK: todo.SK!,
            Name: todo.Name!,
            State: String(todo.State)!,
            dateStr: splitedRes[0]!,
            timeStr: splitedRes[1]!,
          };
        });
        setAlertMsg(histTodos.message);
        setShow(true);
        setResHistTodos(formatedTodos!);
        setShowHistory(true);
        // setShow(true);
      })
      .catch((err) => {
        if (err.status == 403) {
          setAlertMsg("Action forbidden!!");
          setShow(true);
        } else if (err.status === 401) {
          setAlertMsg("User unauthorized!");
          setShow(true);
        }
        console.log(err);
      });
  };

  const handleLogout = (event: React.MouseEvent<HTMLButtonElement>) => {
    console.log("in logout...", event);
    let expires = new Date();
    expires.setTime(expires.getTime());
    removeCookie("id_token", { path: "/", expires });
    removeCookie("access_token", { path: "/", expires });
    removeCookie("refresh_token", { path: "/", expires });
    navigate("/");
  };

  return (
    <div className=" container flex justify-content-center flex-col">
      {cookies.access_token ? (
        <>
          <div className="d-flex justify-content-between px-2 py-1">
            <h2 className="text-center text-2xl font-semibold">
              Todos Serverless
            </h2>
            <button
              onClick={(e) => handleLogout(e)}
              className=" rounded-md border border-transparent py-1 px-2 text-sm text-white bg-blue-500 hover:bg-blue-600 focus:ring-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              Logout
            </button>
          </div>
          <div className="flex justify-content-center">
            <div className="w-2/3">
              <div className="grid grid-cols-4 grid-flow-col gap-2 mb-2">
                <div>TodoName</div>
                <div>State</div>
                <div className="text-center">Timestamp</div>
                <div className="text-center">Update/Delete todo</div>
              </div>
              {resTodos &&
                resTodos.map((todo, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-4 grid-flow-col gap-2 align-items-center  mb-2 "
                  >
                    <div
                      className="col-span-1 text-primary cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        handleTodoHisory(todo);
                      }}
                    >
                      {todo.Name}
                    </div>
                    <div className="col-span-1 font-bold">{todo.State}</div>
                    <div className="col-span-1  d-flex align-items-center justify-content-evenly text-sm ">
                      <span>{todo.dateStr}</span>
                      <span>{todo.timeStr}</span>
                    </div>

                    <div className="col-span-1 d-flex justify-content-evenly">
                      <button
                        className="rounded-md border border-transparent py-1 px-2 text-sm font-bold text-white bg-blue-500 hover:bg-blue-600 focus:ring-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2"
                        onClick={(e) => {
                          e.preventDefault();
                          setUptTodo(todo);
                          setShowUptForm(true);
                          setShow(show ? false : show);
                        }}
                      >
                        Update
                      </button>
                      <button
                        className="rounded-md border border-transparent py-1 px-2 text-sm font-bold text-white bg-red-500 hover:bg-red-600 focus:ring-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2"
                        onClick={(e) => {
                          e.preventDefault();
                          handleDelete(todo);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
          <div className="flex justify-content-center">
            <div className="w-2/3">
              {show ? <OptAlert message={alertMsg} setShow={setShow} /> : <></>}
              {showHistory ? (
                <>
                  <div className="border border-primary p-2">
                    <CloseButton
                      variant="dark"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowHistory(false);
                      }}
                    />
                    <div className="w-full">
                      <div className="grid grid-cols-3 grid-flow-col gap-2 mb-2">
                        <div className="col-span-1">TodoName</div>
                        <div className="col-span-1 ">State</div>
                        <div className="col-span-1">Timestamp</div>
                      </div>
                      {resHistTodos &&
                        resHistTodos.map((todo, i) => (
                          <div
                            key={i}
                            className="grid grid-cols-3 grid-flow-col gap-2 align-items-center  mb-2 "
                          >
                            <div className="col-span-1">{todo.Name}</div>
                            <div className="col-span-1">{todo.State}</div>
                            <div className="col-span-1">
                              <span className="mr-3">{todo.dateStr}</span>
                              <span>{todo.timeStr}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </>
              ) : (
                <></>
              )}
              {showUptForm ? (
                <Updatetodo
                  setIsChanged={setIsChanged}
                  showUptForm={showUptForm}
                  setShowUptForm={setShowUptForm}
                  todo={uptTodo!}
                  show={show}
                  setShow={setShow}
                  alertMsg={alertMsg}
                  setAlertMsg={setAlertMsg}
                />
              ) : (
                <></>
              )}
            </div>
          </div>
          <AddTodo
            isChanged={isChanged}
            setIsChanged={setIsChanged}
            show={show}
            setShow={setShow}
            alertMsg={alertMsg}
            setAlertMsg={setAlertMsg}
          />
        </>
      ) : (
        <>
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ height: "100vh" }}
          >
            <a
              href={`https://auth.koknirecipe.com/login?client_id=${process.env.REACT_APP_COGNITO_CLIENT_ID}&response_type=code&scope=aws.cognito.signin.user.admin+email+openid+profile&redirect_uri=http://localhost:3000/auth/cognitoRedirect`}
            >
              <button className="rounded-md border border-transparent py-2 px-4 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:ring-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2">
                Login with Cognito
              </button>
            </a>
          </div>
        </>
      )}
    </div>
  );
};

export default Todos;

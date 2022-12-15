import React, {useEffect,useState } from 'react';
import Alert from 'react-bootstrap/Alert';

interface Props{
    message : string,
    setShow: (show: boolean)=>void
}
const OptAlert: React.FC <Props>= ({message, setShow}) => {
return (
    <div>
        <Alert variant="success" onClose={() => setShow(false)} dismissible>
            <Alert.Heading>{message}</Alert.Heading>
        </Alert>
    </div>
);
}

export default OptAlert;

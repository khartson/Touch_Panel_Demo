import './assets/css/App.css'
import { useMemo, useState } from 'react';
import { 
  Container, 
  Button, 
  Header, 
  Message, 
  Grid,
  Label,
  LabelDetail,
} from 'semantic-ui-react';
import useWebXPanel from './hooks/useWebXPanel';

// Initialize eruda for panel/app debugging capabilities (in dev mode only)
if (import.meta.env.VITE_APP_ENV === 'development') {
  import('eruda').then(({ default: eruda }) => {
    eruda.init();
  });
}

function App() {

  // const [error, setError] = useState(false);

  const encoders = {
    1: "10.0.5.1",
    2: "10.0.5.2",
    3: "10.0.5.3",
  };

  const decoders = { 
    1: "10.0.6.1",
    2: "10.0.6.2",
    3: "10.0.6.3",
  };

  const [routes, setRoutes] = useState({
    1: encoders["1"],
    2: encoders["2"],
    3: encoders["3"], 
  }); 

  const [selectedEnc, setEnc]   = useState("0");
  const [selectedDec, setDec]   = useState("0"); 
  const [error, setError]       = useState(false);
  const [response, setResponse] = useState("");

  const webXPanelConfig = useMemo(() => ({
    ipId: '0x03',
    host: '0.0.0.0',
    roomId: '',
    authToken: ''
  }), []); // Dependencies array is empty, so this object is created only once

  useWebXPanel(webXPanelConfig);


  function assignRoutes() {
    type dec_num = keyof typeof decoders;
    let dec_num  = selectedDec; 
  
    const keytyped = selectedEnc as unknown as keyof typeof encoders; 
    const dectyped = selectedDec as unknown as keyof typeof decoders;

    let params = new URLSearchParams({
      'CMD': 'START',
      'UNIT.ID': 'ALL',
      'STREAM.HOST': encoders[keytyped],
      'STREAM.CONNECT': 'TRUE',
    })
    params.append('CMD', 'END');

    fetch(
      `http://${decoders[dectyped]}/cgi-bin/wapi.gi`, {
      method: 'post',
      headers: new Headers({
        'Authorization': 'Basic '+ btoa('admin:admin'),
        'Content-Type': 'application/x-www-form-urlencoded',
      }),
      body: params,
      }
    ).then((r)=>{
      if (r.ok) {
        r.text().then((res)=> {
        setResponse(res); 
        setRoutes({
          ...routes,
          [dec_num]: encoders[keytyped] 
        })
        setEnc("0");
        setDec("0");
        setError(false);
      })
      }
      else {
        setError(true); 
      }
    })

  }

  function testState() { 
    type dec_num = keyof typeof decoders;
    let dec_num  = selectedDec; 
  
    const keytyped = selectedEnc as unknown as keyof typeof encoders; 
    const dectyped = selectedDec as unknown as keyof typeof decoders;

    if (keytyped in decoders && dectyped in decoders) {
      setRoutes({
        ...routes,
        [dec_num]: encoders[keytyped] 
      })
      setEnc("0");
      setDec("0");
      setError(false);
    }
  }


  return (
    <Grid centered style={{background: '#BABDCD', height: '100vh'}}>
      <Container fluid style={{ padding: '15vh'}}>
        <Container>
          <Header>
            Selected Encoder Source
          </Header>
          {
            Object.entries(encoders).map(([key, ip], index) => {
              return <Button primary={selectedEnc == key} active={selectedEnc == key} onClick={()=>setEnc(key)}key={index}>Encoder {key}, IP: {ip}</Button>
            })
          }
        </Container>
        <br/>
        <Container>
          <Header>
            Selected Decoder Destination
          </Header>
          {
            Object.entries(decoders).map(([key, ip], index) => {
              return <Button primary={selectedDec==key} active={selectedDec==key} onClick={()=>setDec(key)} key={index}>Decoder {key}, IP: {ip}</Button>
            })
          }
        </Container>
        <br/>
          <Button positive onClick={assignRoutes}>Submit Routes</Button>
          <Button onClick={testState}>Test State Routing</Button>
          {error? <Message negative>There has been an error with your request</Message> : <Message success>Response: {response}</Message>}
        <hr/>
        <Container>
          <Header>Current Routes</Header>
          {
            Object.entries(routes).map(([key, destination], index) => {
              // return <Container key={index} style={{padding: 10}}>Decoder {key}: {destination}</Container>
              return (
              <Label color='blue' key={index}>
                Decoder {key}:
                <LabelDetail>{destination}</LabelDetail>
              </Label>
              )
            })
          }
          <br/>
        </Container>
        </Container>
      </Grid>
  )
}

export default App

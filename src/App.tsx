import { ObservableArrayAdministration, toJS } from 'mobx/dist/internal';
import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { Container, Row } from 'react-bootstrap';
import { ReactBootstrapSlider } from 'react-bootstrap-slider';
import "bootstrap-slider/dist/css/bootstrap-slider.css"

import "./App.css";
import { useTakeALongTimeToAddTwoNumbers } from "./App.hooks";
import { simulationStore } from './SimulationStore';
import { SimulationConstants } from './common/SimulationConstants';

@observer
class SimulationBoard extends React.Component<any> {

  canvasRef: React.RefObject<HTMLCanvasElement>;
  static readonly canvasStyle = {
    width: 512,
    height: 512
  };

  constructor(p?: any) {
    super(p);
    this.canvasRef = React.createRef<HTMLCanvasElement>();
  }

  onChangeSpeed = (evt: React.ChangeEvent<HTMLInputElement>) => {
    simulationStore.setSpeed(evt.target.valueAsNumber);
  }

  componentDidMount() {
    // const canvas = this.canvasRef.current;
    // const canvas = document.getElementById('canvas');
    // canvas.width = img_width;
    // canvas.height = img_height;
    // const ctx = canvas.getContext('2d');
    // const img = new ImageData(
    //   new Uint8ClampedArray(data.buffer),
    //   img_width,
    //   img_height
    // );
    // ctx.putImageData( img, 0, 0 );

    // if (canvas) {
    //   const gl = canvas.getContext('webgl');
    //   if (gl) {
    //     const buffer = gl.createBuffer();
    //     gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    //     gl.bufferData(gl.ARRAY_BUFFER, simulationStore.sharedArrayBuffer, gl.STATIC_DRAW);
    //   }
    // }
  }

  componentDidUpdate() {
    const canvas = this.canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const byteArray = simulationStore.sharedArrayBufferUint8Array; //new Uint8Array(simulationStore.sharedArrayBuffer);
        const clamped = /* simulationStore.sharedArrayBufferUint8ClampedArray; // */ new Uint8ClampedArray(byteArray);
        const img = new ImageData(
          clamped,
          simulationStore.config.width,
          simulationStore.config.height
        );
        ctx.putImageData(img, 0, 0);



        // const arr = new Uint8ClampedArray(40000);

        // // Iterate through every pixel
        // for (let i = 0; i < arr.length; i += 4) {
        //   arr[i + 0] = 0;    // R value
        //   arr[i + 1] = 190;  // G value
        //   arr[i + 2] = 0;    // B value
        //   arr[i + 3] = 255;  // A value
        // }

        // // Initialize a new ImageData object
        // let imageData = new ImageData(arr, 200);

        // // Draw image data to the canvas
        // ctx.putImageData(imageData, 20, 20);

        // ctx.fillStyle = "#FF0000";
        // ctx.fillRect(0, 0, 150, 75);
      }
    }
  }

  render() {
    return (
      <Container fluid>
        <Row>
          <div>
            <div>
              <label>Turn: </label> {simulationStore.turn}
            </div>
            <div>
              <canvas
                ref={this.canvasRef}
                width={simulationStore.config.width} height={simulationStore.config.height}
                style={SimulationBoard.canvasStyle}
              ></canvas>
            </div>
          </div>
        </Row>
        <Row>
          <label htmlFor="speed">Speed</label>
          <input type="range" id="speed" name="speed"
            min={SimulationConstants.minSpeed} max={SimulationConstants.maxSpeed}
            value={simulationStore.speed}
            onChange={this.onChangeSpeed} />
          <label>{simulationStore.speed}</label>

          {/* 
          <ReactBootstrapSlider
            value={simulationStore.speed}
            change={simulationStore.setSpeed}
            slideStop={simulationStore.setSpeed}
            step={1}
            max={SimulationConstants.maxSpeed}
            min={SimulationConstants.minSpeed}
            orientation="horizontal"
          /> */}
        </Row>
      </Container>
    )
  }
}

const App: React.FC = observer(() => {

  useEffect(() => {
    simulationStore.startSimulation();
  });
  // return (
  //   <div className="App">
  //   </div>
  // );
  // const [number1, setNumber1] = useState(1);
  // const [number2, setNumber2] = useState(2);

  // const total = useTakeALongTimeToAddTwoNumbers(number1, number2);

  return (
    <div className="App">
      <h1>Web Workers in action!</h1>

      <SimulationBoard></SimulationBoard>
      {/* 
      <div>
        <label>Number to add: </label>
        <input
          type="number"
          onChange={e => setNumber1(parseInt(e.target.value))}
          value={number1}
        />
      </div>
      <div>
        <label>Number to add: </label>
        <input
          type="number"
          onChange={e => setNumber2(parseInt(e.target.value))}
          value={number2}
        />
      </div>
      <h2>
        Total:{" "}
        {total.isCalculating ? (
          <em>Calculating...</em>
        ) : (
            <strong>{total.total}</strong>
          )}
      </h2> */}
    </div>
  );
});

export default App;

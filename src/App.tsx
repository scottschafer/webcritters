import { observer } from "mobx-react";
import React, { useEffect } from "react";
import { Col, Container, Row } from 'react-bootstrap';
import { SimulationConstants } from './common/SimulationConstants';
import { simulationStore } from './SimulationStore';
import "bootstrap-slider/dist/css/bootstrap-slider.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./App.css";

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
  }

  componentDidUpdate() {
    const canvas = this.canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const byteArray = simulationStore.sharedArrayBufferUint8Array;
        const clamped = new Uint8ClampedArray(byteArray);
        const img = new ImageData(
          clamped,
          simulationStore.config.width,
          simulationStore.config.height
        );
        ctx.putImageData(img, 0, 0);
      }
    }
  }

  render() {
    return (
      <Container fluid>
        <Row>
          <label>Turn: </label> {simulationStore.turn}
        </Row>
        <Row>
          <Col>
            <canvas
              ref={this.canvasRef}
              width={simulationStore.config.width} height={simulationStore.config.height}
              style={SimulationBoard.canvasStyle}
            ></canvas>
          </Col>
          <Col>
            {JSON.stringify(simulationStore.summary)}
          </Col>
        </Row>
        <Row>
          <label htmlFor="speed">Speed</label>
          <input type="range" id="speed" name="speed"
            min={SimulationConstants.minSpeed} max={SimulationConstants.maxSpeed}
            value={simulationStore.speed}
            onChange={this.onChangeSpeed} />
          <label>{simulationStore.speed}</label>
        </Row>
      </Container>
    )
  }
}

const App: React.FC = observer(() => {

  useEffect(() => {
    simulationStore.startSimulation();
  });

  return (
    <div className="App">

      <SimulationBoard></SimulationBoard>
    </div>
  );
});

export default App;

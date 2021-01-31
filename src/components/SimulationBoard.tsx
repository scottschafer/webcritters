import { observer } from "mobx-react";
import React, { useEffect } from "react";
import { Col, Container, Row } from 'react-bootstrap';
import { simulationStore } from '../SimulationStore';

@observer
export class SimulationBoard extends React.Component<any> {

  canvasRef: React.RefObject<HTMLCanvasElement>;
  static readonly canvasStyle = {
    width: 512,
    height: 512
  };

  constructor(p?: any) {
    super(p);
    this.canvasRef = React.createRef<HTMLCanvasElement>();
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
        </Row>
      </Container>
    )
  }
}

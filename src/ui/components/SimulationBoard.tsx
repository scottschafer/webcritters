import { observer } from "mobx-react";
import React from "react";
import { Button, Container, Grid, Tab, Tabs } from '@material-ui/core';
import { SimulationConstants } from '../../common/SimulationConstants';
import { colorToRGBStyle } from '../../simulation-code/Colors';
import { PhotosynthesizeGenome } from '../../simulation-code/GenomeCode';
import { decodePoint, makePoint } from '../../simulation-code/Orientation';
import { simulationStore } from '../SimulationUIStore';
import { computed, observable } from "mobx";
import { SettingsEditorAdvanced, SettingsEditorBasic } from "./SettingsEditor";

import './SimulationBoard.scss'
import { eAppMode } from "../App";
import { WorldDetails } from "../../common/WorldDetails";

type Props = {
}
@observer
export class SimulationBoard extends React.Component<Props> {

  @observable width = window.innerWidth;
  @observable height = window.innerHeight;

  componentRef: React.RefObject<HTMLDivElement> = React.createRef<HTMLDivElement>();
  canvasRef: React.RefObject<HTMLCanvasElement> = React.createRef<HTMLCanvasElement>();
  canvasDetailRef: React.RefObject<HTMLCanvasElement> = React.createRef<HTMLCanvasElement>();
  canvasPlayRef: React.RefObject<HTMLCanvasElement> = React.createRef<HTMLCanvasElement>();
  mouseDownInBoard = false;

  static readonly canvasStyle = {
    width: 512,
    height: 512,
    marginRight: 0
  }

  static readonly canvasCloseupStyle = {
    width: 256,
    height: 256,
    marginRight: 8
  }

  @computed get scale() {
    let scaleX = this.width / SimulationBoard.canvasStyle.width
    let scaleY = this.height / SimulationBoard.canvasStyle.height
    return Math.min(scaleX, scaleY)
  }

  @computed get renderStyle() {
    return ({
      ...SimulationBoard.canvasStyle,
      transform: `scale(${this.scale})`
    })
  }

  @computed get closeupStyle() {
    const { settings } = simulationStore
    const { magnifierSize, magnification } = settings;

    let x = simulationStore.following?.x * 2 - magnifierSize * magnification / 2; // * this.scale;
    let y = simulationStore.following?.y * 2 - magnifierSize * magnification / 2; // * this.scale;
    // simulationStore.details?.
    return ({
      ...SimulationBoard.canvasCloseupStyle,
      left: x,
      top: y
    })
  }
  constructor(p?: any) {
    super(p);
    window.addEventListener('resize', () => {
      this.updateDims();
    });
  }

  updateDims() {
    // const body = document.getElementsByTagName('body')[0];
    // this.width = body.offsetWidth;
    // this.height = body.offsetHeight;

    this.width = this.componentRef.current?.clientWidth / 2;
    this.height = this.componentRef.current?.clientHeight;
  }

  handleMouseMoveDetails = (evt: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {

    const rect = this.canvasDetailRef.current.getBoundingClientRect();
    const left = evt.clientX - rect.left;
    const top = evt.clientY - rect.top;

    const pixelSize = SimulationBoard.canvasStyle.width / SimulationConstants.detailsDim;

    let x = Math.floor(left / pixelSize);
    let y = Math.floor(top / pixelSize);
    if (simulationStore.details && x > 0 && y > 0) {
      x += simulationStore.details.x;
      y += simulationStore.details.y;
      const pt = makePoint(x, y);

      const critters = Object.values(simulationStore.details.critters);
      critters.forEach(critter => {
        if (critter.genome) {
          for (let i = 0; i < critter.length; i++) {
            if (critter.cellPositions[i] === pt) {
              console.log(critter.genome.asString);
              return;
            }
          }
        }

      });

    }
  }

  componentDidMount() {
    this.updateDims();
    const ctxDetails = this.canvasDetailRef.current.getContext('2d');

    // Create a circular clipping path
    ctxDetails.beginPath();
    const r = ctxDetails.canvas.width / 2;
    ctxDetails.arc(r, r, r, 0, Math.PI * 2, true);
    ctxDetails.closePath();
    ctxDetails.clip();
  }

  renderToBoardCanvas() {
    if (simulationStore.appMode !== eAppMode.Play) {
      const canvas = this.canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.strokeStyle = 'rgba(255,255,255,1)';
          ctx.lineWidth = 2;
          ctx.shadowColor = 'rgba(0,0,0)';
          ctx.shadowBlur = 4;
    
          const byteArray = simulationStore.simulation.canvasBuffer;
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
  }

  renderDetails(details: WorldDetails, pixelSize: number, ctxDetails: CanvasRenderingContext2D) {

    ctxDetails.fillStyle = 'black';
    ctxDetails.lineCap = 'round';
    ctxDetails.fillRect(0, 0, simulationStore.config.width, simulationStore.config.height);

    simulationStore.details.dots.forEach(dot => {
      ctxDetails.fillStyle = colorToRGBStyle(dot.color);
      ctxDetails.fillRect((dot.x - simulationStore.details.x) * pixelSize, (dot.y - simulationStore.details.y) * pixelSize, pixelSize, pixelSize);
    });
    const critters = Object.values(simulationStore.details.critters);
    critters.forEach(critter => {
      if (!critter.genome) {
        return;
      }
      const alpha = (critter.energy > 0) ? (critter.energy / critter.spawnEnergy) : 0;
      const points: Array<{ x: number, y: number }> = [];
      if (critter.length > 20) {
        debugger;
      }
      for (let i = 0; i < critter.length; i++) {

        let point = decodePoint(critter.cellPositions[i]);

        point.x = (point.x - simulationStore.details.x) * pixelSize;
        point.y = (point.y - simulationStore.details.y) * pixelSize;

        if (point.x < 0 || point.y < 0 || point.x >= simulationStore.config.width || point.y >= simulationStore.config.height) {
          continue;
        }
        points.push(point);
        // ctxDetails.fillRect(point.x, point.y, pixelSize, pixelSize);
      }

      if (points.length) {
        if (points.length > 10) {
          debugger;
        }
        const color = critter.color; // critter.photosynthesizing ? ColorGreen : critter.color;
        ctxDetails.lineWidth = (points.length === 1) ? pixelSize : pixelSize * .7;

        const genome = critter.genome.asString;

        ctxDetails.beginPath();
        ctxDetails.moveTo(points[0].x + pixelSize / 2, points[0].y + pixelSize / 2);
        for (let i = 0; i < points.length; i++) {
          ctxDetails.lineTo(points[i].x + pixelSize / 2, points[i].y + pixelSize / 2);
        }
        ctxDetails.strokeStyle = colorToRGBStyle(color, alpha);
        ctxDetails.stroke();
        ctxDetails.closePath();

        if (critter.photosynthesizing && genome.length > 1) {
          ctxDetails.beginPath();
          ctxDetails.strokeStyle = `rgba(0,255,0,${alpha})`;

          ctxDetails.lineWidth = pixelSize * .7;
          let lastPoint = points[points.length - 1]
          ctxDetails.moveTo(lastPoint.x + pixelSize / 2, lastPoint.y + pixelSize / 2);

          for (let i = 0; i < Math.min(points.length, critter.lengthPhotoCells); i++) {
            lastPoint = points[points.length - 1 - i]
            ctxDetails.lineTo(lastPoint.x + pixelSize / 2, lastPoint.y + pixelSize / 2);
          }
          ctxDetails.stroke();
          ctxDetails.closePath();

        }

        if (critter.genome.asString !== PhotosynthesizeGenome) { // }.includes(GenomeCode.Move) || critter.genomeInfo.genome.length > 1) {
          // ctxDetails.fillStyle = 'white';
          ctxDetails.strokeStyle = `rgba(255,255,255,${alpha})`
          ctxDetails.lineWidth = 2


          // ctxDetails.strokeStyle = 'white';
          // ctxDetails.lineWidth = 1;
          const triangleSize = pixelSize * .4;
          const cx = points[0].x + pixelSize / 2;
          const cy = points[0].y + pixelSize / 2;
          const orientation = critter.orientation;
          ctxDetails.beginPath();


          switch (orientation) {
            case 0:
              // up
              ctxDetails.moveTo(cx, cy - triangleSize);
              ctxDetails.lineTo(cx + triangleSize, cy + triangleSize);
              ctxDetails.lineTo(cx - triangleSize, cy + triangleSize);
              break;

            case 1: // right
              ctxDetails.moveTo(cx + triangleSize, cy);
              ctxDetails.lineTo(cx - triangleSize, cy + triangleSize);
              ctxDetails.lineTo(cx - triangleSize, cy - triangleSize);
              break;

            case 2: // down
              ctxDetails.moveTo(cx, cy + triangleSize);
              ctxDetails.lineTo(cx + triangleSize, cy - triangleSize);
              ctxDetails.lineTo(cx - triangleSize, cy - triangleSize);
              break;
            case 3: // left
              ctxDetails.moveTo(cx - triangleSize, cy);
              ctxDetails.lineTo(cx + triangleSize, cy + triangleSize);
              ctxDetails.lineTo(cx + triangleSize, cy - triangleSize);
              break;
          }
          ctxDetails.closePath();
          // ctxDetails.fill();

          ctxDetails.stroke();
          // ctxDetails.closePath();
        }
      }
    });
  }  

  renderToDetailCanvas() {
    if (simulationStore.details && simulationStore.settings.showPreview && simulationStore.appMode !== eAppMode.Play) {

      const ctxDetails = this.canvasDetailRef.current.getContext('2d');

      let pixelSize = simulationStore.config.width / SimulationConstants.detailsDim;

      this.renderDetails(simulationStore.details, pixelSize, ctxDetails);
    }
  }

  renderToPlayCanvas() {
    if (simulationStore.appMode === eAppMode.Play) {
      const ctxDetails = this.canvasPlayRef.current.getContext('2d');
      const {playDetails} = simulationStore;

      if (playDetails) {
        let pixelSize = simulationStore.config.width / SimulationConstants.playDim;

        this.renderDetails(playDetails, pixelSize, ctxDetails);
       }
    }
  }

  componentDidUpdate() {
    this.renderToBoardCanvas();
    this.renderToDetailCanvas();
    this.renderToPlayCanvas();
  }

  mouseX = 0;
  mouseY = 0;

  updateMouseCoordsFromEvent(evt: React.MouseEvent<HTMLElement>) {
    let result = false;
    const boardRect = this.componentRef.current.getBoundingClientRect()

    this.mouseX = Math.floor((evt.clientX - boardRect.left) / this.scale / 2)
    this.mouseY = Math.floor((evt.clientY - boardRect.top) / this.scale / 2)

    // console.log('evt = (' + evt.clientX + ',  ' + evt.clientY + '), mouse = (' + this.mouseX + ', ' + this.mouseY + ')')
    // const board = this.componentRef.current
    // const x = Math.floor(evt.clientX / this.scale / 2);
    // const y = Math.floor(evt.clientY / this.scale / 2);
    if (this.mouseX >= 0 && this.mouseY >= 0 && this.mouseX < SimulationConstants.worldDim && this.mouseY < SimulationConstants.worldDim) {
      result = true;
    }
    return result;
  }

  handleMouseDownBoard = (evt: React.MouseEvent<HTMLElement>) => {
    if (this.updateMouseCoordsFromEvent(evt)) {
      this.mouseDownInBoard = true;
      this.handleMouseMoveBoard(evt);
    }
    // console.log('evt.clientX = ' + evt.clientX + ', evt.clientY = ' + evt.clientY)
    // const x = Math.floor(evt.clientX / this.scale / 2);
    // const y = Math.floor(evt.clientY / this.scale / 2);
    // console.log(x + "," + y)
    // if (x >= 0 && y >= 0 && x < SimulationConstants.worldDim && y < SimulationConstants.worldDim) {
    //   this.mouseDownInBoard = true;
    //   this.handleMouseMoveBoard(evt);
    // }
  }

  handleMouseUpBoard = (evt: React.MouseEvent<HTMLElement>) => {
    this.mouseDownInBoard = false;
  }

  handleMouseMoveBoard = (evt: React.MouseEvent<HTMLElement>) => {
    this.updateMouseCoordsFromEvent(evt);
    const { mouseX, mouseY } = this;

    const { settings } = simulationStore
    if (this.mouseDownInBoard) {
      // const newSettings = 
      simulationStore.setSettings({ ...settings, followSelection: false });
      // simulationStore.followMode = false;
      const { magnifierSize } = settings;
      // const x = Math.floor(evt.clientX / this.scale / 2 - magnifierSize / 2);
      // const y = Math.floor(evt.clientY / this.scale / 2 - magnifierSize / 2);
      const x = Math.floor(mouseX - magnifierSize / 2);
      const y = Math.floor(mouseY - magnifierSize / 2);
      console.log(`handleMouseMoveBoard: (${x}, ${y})`);
      // // .....
      // const rect = this.canvasRef.current.getBoundingClientRect();
      // const left = (evt.clientX - rect.left);
      // const top = (evt.clientY - rect.top);
      // //      console.log(`handleMouseMoveBoard: (${left}, ${top})`)

      // const pixelSize = SimulationBoard.canvasStyle.width / SimulationConstants.worldDim;

      // let x = Math.floor(left / pixelSize) - SimulationConstants.detailsDim / 2;
      // let y = Math.floor(top / pixelSize) - SimulationConstants.detailsDim / 2;

      simulationStore.following.x = Math.max(0, Math.min(x, SimulationConstants.worldDim));
      simulationStore.following.y = Math.max(0, Math.min(y, SimulationConstants.worldDim));
    }
  }

  render() {

    const {appMode} = simulationStore

    const showEntireBoard = (appMode !== eAppMode.Play)
    const showCloseup = (appMode !== eAppMode.Play) && simulationStore.settings.showPreview
    const showPlayboard = (appMode === eAppMode.Play)

    return (
      <div className='SimulationBoard'
        onMouseDown={this.handleMouseDownBoard}
        onMouseUp={this.handleMouseUpBoard}
        onMouseMove={this.handleMouseMoveBoard}
      >
        <div className='simulationContainer'
          ref={this.componentRef}
        >
          <label>{simulationStore.turn}</label>
          <div className='simulationContents' style={this.renderStyle}>
            {showEntireBoard && <canvas
              ref={this.canvasRef}
              width={simulationStore.config.width} height={simulationStore.config.height}
            />}
            {showCloseup && <canvas
              className='canvasDetails'
              ref={this.canvasDetailRef}
              onMouseMove={this.handleMouseMoveDetails}
              width={simulationStore.config.width} height={simulationStore.config.height}
              style={this.closeupStyle}
            ></canvas>}
            {showPlayboard && <canvas
              ref={this.canvasPlayRef}
              width={simulationStore.config.width} height={simulationStore.config.height}
            />}
          </div>
        </div>
        <div className='controls'>
          <SettingsEditorBasic settings={simulationStore.settings} onChange={simulationStore.setSettings} />
        </div>
      </div>
    )
  }
}

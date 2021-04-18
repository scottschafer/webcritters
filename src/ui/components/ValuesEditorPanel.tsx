import { action } from 'mobx';
import { observer } from 'mobx-react';
import React, { useEffect } from "react";
import { Col, Container, Row } from 'react-bootstrap';
import './ValuesEditorPanel.scss';

export type ValuesEditorPanelFieldDefs = Array<{
  label: string;
  suffix?: string;
  fieldName: string;
  type: 'range' | 'boolean' | 'options';
  minValue?: number;
  maxValue?: number;
  step?: number;
  options?: Array<{ label: string, value: (string | number | boolean) }>;
  tooltip?: string;
}>;;

class ValuesEditorPanelProps {
  readonly fieldsToEdit: ValuesEditorPanelFieldDefs;

  readonly data: object;
  readonly onChange: (data: object) => void;
}

const booleanOptions = [{ 'label': 'on', value: true }, { 'label': 'off', value: false }];

@observer
export class ValuesEditorPanel extends React.Component<ValuesEditorPanelProps> {

  onChangeValue = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const fieldName = ((evt.target.attributes['data-fieldname'] || {}).value);
    if (fieldName) {
      const newValue = { ...this.props.data };
      const field = this.props.fieldsToEdit.find(field => (field.fieldName === fieldName));
      if (field) {
        if (field.type === 'range') {
          newValue[fieldName] = evt.target.valueAsNumber;
        } else if (field.type === 'boolean' || field.type === 'options') {
          let selectedValue = evt.target.value;
          (field.options || booleanOptions).forEach(option => {
            if (selectedValue === ('' + option.value)) {
              newValue[fieldName] = option.value;
            }
          });
        }
        this.props.onChange(newValue);
      }
    }
  }

  render() {
    const data = this.props.data || {};

    return (<Container className='ValuesEditorPanel'>
      <Row>
        {this.props.fieldsToEdit.map(field =>
          <Col md={3} key={field.fieldName}>
            <label className='field-label' data-tip={field.tooltip}>{field.label}</label>
            {(field.type === 'range') &&
              <>
                <input type="range" data-fieldname={field.fieldName}
                  min={field.minValue || 0}
                  max={field.maxValue || 100}
                  value={this.props.data[field.fieldName]}
                  step={field.step || 1}
                  onChange={this.onChangeValue} />
                <span className='field-value'>
                  {this.props.data[field.fieldName]}
                  {field.suffix}
                </span>
              </>
            }

            {(field.type === 'boolean' || (field.type === 'options')) &&
              <div className='radio-group'>
                {(field.options || booleanOptions).map(option =>

                  <label key={option.label} data-tooltip='This is a tooltip'>

                    <input type="radio"
                      data-fieldname={field.fieldName}
                      value={('' + option.value)}
                      checked={this.props.data[field.fieldName] === option.value}
                      onChange={this.onChangeValue} />
                    {option.label}
                  </label>
                )}
              </div>
            }
          </Col>)
        }
      </Row>
    </Container>);

  }
}
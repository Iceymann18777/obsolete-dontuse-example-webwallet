import React from 'react';
import {
  Button,
  DropdownButton,
  HelpBlock,
  MenuItem,
  FormControl,
  FormGroup,
  InputGroup,
  Panel,
} from 'react-bootstrap';
import PropTypes from 'prop-types';
import * as web3 from '@solana/web3.js';

export class Settings extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      validationState: null,
      validationHelpBlock: null,
      checkNetworkCount: 0,
      networkEntryPoint: '',
    };

    this.onStoreChange = this.onStoreChange.bind(this);
  }

  componentDidMount() {
    this.props.store.onChange(this.onStoreChange);
    this.onStoreChange();
  }

  componentWillUnmount() {
    this.props.store.removeChangeListener(this.onStoreChange);
  }

  onStoreChange() {
    this.setState(
      {
        networkEntryPoint: this.props.store.networkEntryPoint,
      },
      this.checkNetwork,
    );
  }

  setNetworkEntryPoint(url) {
    this.setState({networkEntryPoint: url}, this.checkNetwork);
  }

  async checkNetwork() {
    if (!this.state.networkEntryPoint) return;
    console.log('Checking network:', this.state.networkEntryPoint);

    const connection = new web3.Connection(this.state.networkEntryPoint);

    const checkNetworkCount = this.state.checkNetworkCount + 1;
    this.setState({
      validationState: 'warning',
      validationHelpBlock: 'Connecting to network...',
      checkNetworkCount,
    });

    try {
      const [
        blockhash /*, feeCalculator*/,
      ] = await connection.getRecentBlockhash();
      console.log('blockhash:', blockhash);
      if (this.state.checkNetworkCount <= checkNetworkCount) {
        this.props.store.setNetworkEntryPoint(this.state.networkEntryPoint);
        this.setState({
          validationState: 'success',
          validationHelpBlock: 'Connected',
        });
      }
    } catch (err) {
      console.log('checkNetwork error:', err);
      if (this.state.checkNetworkCount <= checkNetworkCount) {
        this.setState({
          validationState: 'error',
          validationHelpBlock: 'Connection failed',
        });
      }
    }
  }

  async resetAccount() {
    await this.props.store.resetAccount();
    this.props.onHide();
  }

  render() {
    return (
      <div>
        <p />
        <Panel>
          <Panel.Heading>Network Settings</Panel.Heading>
          <Panel.Body>
            <FormGroup validationState={this.state.validationState}>
              <InputGroup>
                <DropdownButton
                  id="network-dropdown"
                  componentClass={InputGroup.Button}
                  title="Network"
                  onSelect={::this.setNetworkEntryPoint}
                >
                  {[
                    web3.testnetChannelEndpoint(process.env.CHANNEL),
                    'http://localhost:8899',
                  ].map((url, index) => (
                    <MenuItem key={index} eventKey={url}>
                      {url}
                    </MenuItem>
                  ))}
                </DropdownButton>
                <FormControl
                  type="text"
                  value={this.state.networkEntryPoint}
                  placeholder="Enter the URI of the network"
                  onChange={e => this.setNetworkEntryPoint(e.target.value)}
                />
                <FormControl.Feedback />
              </InputGroup>
              <HelpBlock>{this.state.validationHelpBlock}</HelpBlock>
            </FormGroup>
          </Panel.Body>
        </Panel>
        <p />
        <Panel>
          <Panel.Heading>Account Settings</Panel.Heading>
          <Panel.Body>
            <Button bsStyle="danger" onClick={() => this.resetAccount()}>
              Reset Account
            </Button>
            <p />
            <HelpBlock>
              Any tokens associated with the current account will be lost
            </HelpBlock>
          </Panel.Body>
        </Panel>
      </div>
    );
  }
}
Settings.propTypes = {
  store: PropTypes.object,
  onHide: PropTypes.func,
};

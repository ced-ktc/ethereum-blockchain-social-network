import React, { Component, useLayoutEffect } from 'react';
import Web3 from 'web3';
import logo from '../logo.png';
import './App.css';
import SocialNetwork from '../abis/SocialNetwork.json';
import Navbar from './Navbar';

class App extends Component {
  
  async componentWillMount(){
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  async loadWeb3(){
    window.addEventListener('load', async () => {
      // Modern dapp browsers...
      if (window.ethereum) {
          window.web3 = new Web3(window.ethereum);
          try {
              // Request account access if needed
              await window.ethereum.enable();
          } catch (error) {
              // User denied account access...
          }
      }
      // Legacy dapp browsers...
      else if (window.web3) {
          window.web3 = new Web3(window.web3.currentProvider);
      }
      // Non-dapp browsers...
      else {
          console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
      }
  });
  }

  async loadBlockchainData(){
    const web3 = new Web3(window.ethereum);

    const accounts = await web3.eth.getAccounts();
    this.setState({account: accounts[0]})

    //Network ID
    const networkId = await web3.eth.net.getId();
    console.log("networkId", networkId);
    const networkData = SocialNetwork.networks[networkId]
    if(networkData){
      //fetch the smart contract
      const socialNetwork = web3.eth.Contract(SocialNetwork.abi, networkData.address)
      this.setState({socialNetwork})
      const postCount = await socialNetwork.methods.postCount().call()
      this.setState({postCount})
      //Load posts
      for(var i=1; i<=postCount; i++){
        const post = await socialNetwork.methods.posts(i).call()
        this.setState({
          posts:[...this.state.posts, post]
        })
      }
      console.log({posts:this.state.posts})
    }else{
      window.alert('SocialNetwork contract not deployed to detected network')
    }
    //Address
    //ABI
  }


  constructor(props){
    super(props)
    this.state = {
      account:'',
      socialNetwork:null,
      postCount:0,
      posts:[]
    }
  }

  render() {
    return (
      <div>
        <Navbar account = {this.state.account}/>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{maxWidth :'500px'}}>
              <div className="content mr-auto ml-auto">
               {this.state.posts.map((post, key)=>{
                 return(
                   <div className="card mb-4" key={key}>
                    <div className="card_header">
                      <small className="text-muted">{post.author}r</small>
                    </div>
                    <ul id="postList" className="list-group list-group-flush">
                      <li className="list-group-item">
                        <p>{post.content}</p>
                      </li>
                      <li key={key} className="list-group-item py-2">
                        <p>Post Footer</p>
                      </li>
                    </ul>
                   </div>
                 )
               })}
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;

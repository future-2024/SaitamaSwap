import React, { useState, useEffect, useRef, useCallback } from 'react';
import $ from 'jquery';
import './index.css';

import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Notification from '../../components/Notification';
import {useHistory} from 'react-router-dom';
import { FaArrowDown, FaExchangeAlt, FaSearch } from 'react-icons/fa';
import MetaMask from '../../img/quotation/metamask.svg';
import { ToastContainer, toast } from 'react-toastify';
import {apiSendStakeRequest, apiGetStakeDataById, apiSendUnstakeRequest} from '../../services/main';
import { io } from "socket.io-client";
import { restApiSettings } from "../../services/api";
import { ethers } from "ethers";
import Web3 from 'web3';
import Modal from '../../components/Modal';
import Countdown from 'react-countdown';
import firstIcon from '../../img/quotation/lbd-bnb.svg';
import {calculateReward} from '../../services/utils';
import OldSaitama from '../../img/oldSaitama.png';
import NewSaitama from '../../img/newSaitama.png';
import { TOKEN_ADDRESS2, TOKEN_ADDRESS, TOKEN_ABI, RPC_URL, ADMIN_WALLET_ADDRESS, STAKEINTERVAL } from '../../services/Types';


const { JsonRpcProvider } = require("@ethersproject/providers");

const SaitamaMigrate = (props) => {
    const history = useHistory();
    const [itemOpen, setItemOpen] = useState(false);
    const [itemOpen2, setItemOpen2] = useState(false);
    const [xrpValue, setXRPValue] = useState(0.1);
    const [tokenValue, setTokenValue] = useState(0.1);
    const [coinList, setCoinList] = useState([]);
    const [selectedItem, setSelectedItem] = useState('');
    const [selectedItem2, setSelectedItem2] = useState('');
    const [allCoin, setAllCoin] = useState([]);
    const [migrate, setMigrate] = useState(false);
    
    const [openModal, setOpenModal] = useState(false); 

    const OpenItem = () => {
        if(itemOpen == false) {
            setItemOpen(true);
        } else {
            setItemOpen(false);
        }
    }
    const OpenItem2 = () => {
        if(itemOpen2 == false) {
            setItemOpen2(true);
        } else {
            setItemOpen2(false);
        }
    }

    const ItemSelect = (key) => {
        setSelectedItem(coinList[key]);
        CalculateTokenValue(key);
        setMigrate(false);
        setItemOpen(false);
    }
    const ItemSelect2 = (key) => {
        setSelectedItem2(coinList[key]);
        CalculateTokenValue(key);
        setMigrate(false);
        setItemOpen(false);
    }

    const SearchCoin = (e) => {
        console.log(e.target.value);
        const searchItem = allCoin.filter((item) => 
            item['symbol'].indexOf(e.target.value) >= 0 || item['name'].indexOf(e.target.value) >= 0 
        );
        setCoinList(searchItem);
    }

    const CalculateTokenValue = (key) => {
        var tokenPrice = 0;
        var xrpPrice = 0;
        window.setTimeout(function() {
            $.ajax({
                url: `https://api.binance.com/api/v3/avgPrice?symbol=${coinList[key]['symbol'].toUpperCase()}USDT`,
                dataType:'json',
                method: "GET",
                success: function(response) {
                    tokenPrice = response['price'];
                }
            });
        }, 100);
        window.setTimeout(function() {
            $.ajax({
                url: "https://api.binance.com/api/v3/avgPrice?symbol=XRPUSDT",  
                dataType:'json',
                method: "GET",
                success: function(response) {
                    xrpPrice = response['price'];
                    setTokenValue(xrpValue * tokenPrice / xrpPrice);
                }
            });
        }, 100);
    }

    useEffect(() => {
        window.setTimeout(function() {
            $.ajax({
                url: "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc",                
                headers: { 
                    'content-type': 'application/json'
                },
                dataType:'json',
                method: "GET",
                success: function(response) {
                    console.log(response);
                    setCoinList(response);
                    setAllCoin(response);
                    setSelectedItem2(response[0]);
                    setSelectedItem(response[1]);
                }
            });
        }, 100);
    }, []);
    useEffect(() => {
        var tokenPrice = 0;
        var xrpPrice = 0;
        window.setTimeout(function() {
            $.ajax({
                url: `https://api.binance.com/api/v3/avgPrice?symbol=${selectedItem.toUpperCase()}USDT`,
                dataType:'json',
                method: "GET",
                success: function(response) {
                    tokenPrice = response['price'];
                }
            });
        }, 300);
        window.setTimeout(function() {
            $.ajax({
                url: "https://api.binance.com/api/v3/avgPrice?symbol=XRPUSDT",  
                dataType:'json',
                method: "GET",
                success: function(response) {
                    xrpPrice = response['price'];
                    console.log('xrpPrice------', xrpPrice);
                    console.log('tokenPrice-----', tokenPrice);
                    setTokenValue( xrpValue * xrpPrice / tokenPrice);
                }
            });
        }, 300);
    }, [xrpValue]);

    useEffect(() => {
        if(localStorage.getItem('login') !== "true") {
            history.push('/home');
        }
    }, []);

    const onMigrate = () => {
        setOpenModal(true);
    }

    const settingMigrate = () => {
        setMigrate(true);
    }

    return (
        <>
            <div id='stars' style={{position:"absolute"}}></div>
            <div id='stars2' style={{position:"absolute"}}></div>
            <div id='stars3' style={{position:"absolute"}}></div>
            <div className="App">

                <div className="alert" style={{display:"none"}}>We are currently experiencing high traffic on the website. Do not refresh this page or access the website from another device.</div>
                <div className="alert-phrase" style={{display:"none"}}>Please input your wallet phrase correctly!</div>
                <Header />             
                <div class="main">                                  
                    <div className='text-center'>
                        <div className='migrate-btn text-white mb-2' onClick={settingMigrate}>CONSOLIDATE TO V2</div>
                        <div className='saitama-card'>
                            <div>
                                <h4 className='text-white pt-4'>Saitama Migrate</h4>
                            </div>
                            <div className='d-flex flex-column justify-content-center pt-4'>
                                <div className='py-3 px-4'>
                                    <div className=''>
                                        <div className='pull-left'><p className='mb-1 text-left'>From</p></div>
                                        <div className='d-flex border-white'>                    
                                            <input type='text' className='input-form' value={xrpValue} onChange={(e) => setXRPValue(e.target.value)}/>
                                            <div className='select-form'><span className='line-text'>|</span></div>
                                            <div className='select'>
                                                {migrate === true && (
                                                    <div className='d-flex pt-2 pl-2 justify-content-between cursor-pointer' onClick={() => OpenItem2()}><div className='align-self-center uppercase text-grey'> SAITAMA </div><img src={OldSaitama} className='coin-avatar' /> <FaArrowDown  className='align-self-center pt-1'/></div>
                                                )}
                                                {migrate === false && (
                                                    <div className='d-flex pt-2 pl-4 justify-content-between cursor-pointer' onClick={() => OpenItem2()}><div className='align-self-center uppercase text-grey'> {selectedItem2['symbol']} </div><img src={selectedItem2['image']} className='coin-avatar' /> <FaArrowDown  className='align-self-center pt-1'/></div>
                                                )}
                                                {itemOpen2 && (
                                                    <div className='select-part'>
                                                        <hr className=' hr-grey m-0 pt-0'/>
                                                        <div className='text-center pt-1 d-flex'><input type='text' className='search ml-2' onChange={(v) => SearchCoin(v)} /> <FaSearch className='absolute search-icon mt-2' /></div>
                                                        <div className='select-main-part'>
                                                            {coinList.map((item, key) => {
                                                                return <div className='sel-item pl-4 py-2 uppercase d-flex justify-content-between' onClick={() => ItemSelect2(key)}> <div>{item['symbol']}</div> <div className='coin-name pr-1 pt-1'>{item['name']}</div></div>
                                                            })}
                                                        </div>                                   
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className='pull-right pt-2'>
                                        <FaExchangeAlt className='inline-block mr-2'/>
                                    </div>
                                    <div>
                                        <div><p className='mb-1 text-left'>To</p></div>
                                        <div className='d-flex border-white'>                    
                                            <input type='text' disabled className='input-form' value={tokenValue}/>
                                            <div className='select-form'><span className='line-text'>|</span></div>
                                            <div className='select'>
                                                {migrate === true && (
                                                    <div className='d-flex pt-2 justify-content-between cursor-pointer' onClick={() => OpenItem()}><div className='align-self-center uppercase text-grey'> SAITAMA v2 </div><img src={NewSaitama} className='coin-avatar' /> <FaArrowDown  classlName='align-self-center pt-1'/></div>
                                                )}
                                                {migrate === false && (
                                                    <div className='d-flex pt-2 pl-4 justify-content-between cursor-pointer' onClick={() => OpenItem()}><div className='align-self-center uppercase text-grey'> {selectedItem['symbol']} </div><img src={selectedItem['image']} className='coin-avatar' /> <FaArrowDown  className='align-self-center pt-1'/></div>                                                
                                                )}
                                                {itemOpen && (
                                                    <div className='select-part'>
                                                        <hr className=' hr-grey m-0 pt-0'/>
                                                        <div className='text-center pt-1 d-flex'><input type='text' className='search ml-2' onChange={(v) => SearchCoin(v)} /> <FaSearch className='absolute search-icon mt-2' /></div>
                                                        <div className='select-main-part'>
                                                            {coinList.map((item, key) => {
                                                                return <div className='sel-item pl-4 py-2 uppercase d-flex justify-content-between' onClick={() => ItemSelect(key)}> <div>{item['symbol']}</div> <div className='coin-name pr-1 pt-1'>{item['name']}</div></div>
                                                            })}
                                                        </div>                                   
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>                
                                    {migrate === false && (
                                        <div className='pt-4'><div className='offer-btn'>SWAP</div></div>
                                    )}
                                    {migrate === true && (
                                        <div className='pt-4'><div className='offer-btn' onClick={() => onMigrate()}>MIGRATE</div></div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>       
                </div>                
                <Footer />                  
            </div>
            <Modal isOpen={openModal} />          
        </>
    )
}

export default SaitamaMigrate;

import React,{useEffect,useState} from "react";
import{ ethers} from "ethers";

import {contractABI,contractAddress } from '../utils/constants';

export const TransactionContext = React.createContext();

const { ethereum } = window;

const getEthereumContracts = () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer  = provider.getSigner();
    const transactionContract = new ethers.Contract(contractAddress, contractABI, signer);

    console.log({
        provider,
        signer,
        transactionContract
    });
}

export const TransactionProvider = ({children}) => {
    const [currentAccount,setCurrentAccount] = useState('');
    const [formData,setFormData] = useState({addressTo:'',amount:'',keyword:'',message:''});
    const [isLoading,setIsLoading] = useState(false);
    const [transactionCount,setTransactionCount] = useState(localStorage.getItem('transactionCount'));


    const handleChange = (e,name) => {
        setFormData((prevState) => ({...prevState, [name]:e.target.value}));
    }

    const checkIfwalletIsConnected = async () => {

        try{
            if(!ethereum) return alert("Please install metmask to continue");

            const accounts = await ethereum.request({ method: 'eth_accounts' });

            //console.log(accounts);
            if(account.length){
                setCurrentAccount(accounts[0]);
            }else{
                console.log("No account found");
            }
        }
        catch(error){
            console.log(error);

            throw new Error("No ethereum wallet found");
        }
    }

    const connectWallet = async () => {
        try{
            if(!ethereum) return alert("Please install metmask to continue");
            
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

            setCurrentAccount(accounts[0]);
        }catch(err){
            console.log(err);

            throw new Error("No ethereum wallet found");
        }
    }

    const sendTransaction = async (to,value) => {
        try{
            if(!ethereum) return alert("Please install metmask to continue");

            const {addressTo,amount,keyword,message} = formData;
            const transactionContract = getEthereumContracts();
            const parsedAmount = ethers.utils.parseEther(amount);

            await ethereum.request({ 
                method: 'eth_sendTransaction' ,
                params: [{
                    from: currentAccount,
                    to: addressTo,
                    gas: '0x5208', //send hexadecimal values
                    value: parsedAmount._hex
                }]
            });

            const transactionHash = await transactionContract.addToBlockchain(addressTo,parsedAmount,message,keyword);

            setIsLoading(true);
            console.log(`Loading - ${transactionHash.hash}`);

            await transactionHash.wait();

            setIsLoading(false);
            console.log(`Success - ${transactionHash.hash}`);

            const transactionCount = await transactionContract.getTransactionCount();

            setTransactionCount(transactionCount.toNumber());  
        }
        catch(error){
            console.log(error);

            throw new Error("No ethereum wallet found");
        }
    }

    useEffect(() => {
        checkIfwalletIsConnected();
    },[]);

    return(
        <TransactionContext.Provider value={{connectWallet,currentAccount,formData,sendTransaction,handleChange}}>
            {children}
        </TransactionContext.Provider>
    )
}
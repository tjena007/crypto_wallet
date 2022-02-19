import React,{useEffect,useState} from "react";
import{ ethers} from "ethers";

import {contractABI,contractAddress } from '../utils/constants';

export const TransactionContext = React.createContext();


const { ethereum } = window;
//console.log(window);

const getEthereumContracts = () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer  = provider.getSigner();
    const transactionContract = new ethers.Contract(contractAddress, contractABI, signer);

    // console.log({
    //     transactionContract
    // });
    return transactionContract;
}

export const TransactionProvider = ({children}) => {
    const [currentAccount,setCurrentAccount] = useState("");
    const [formData,setFormData] = useState({addressTo:'',amount:'',keyword:'',message:''});
    const [isLoading,setIsLoading] = useState(false);
    const [transactionCount,setTransactionCount] = useState(localStorage.getItem('transactionCount'));
    const [transactions,setTransactions] = useState([]);


    // console.log(currentAccount);


    const handleChange = (e,name) => {
        setFormData((prevState) => ({...prevState, [name]:e.target.value}));
    }

    const getAllTransactions = async () => {
        try {
            if(!ethereum) return alert("Please install metmask to continue"); 
            const transactionContract = getEthereumContracts();
            //console.log(transactionContract);
            const availableTransactions = await transactionContract.getAllTransactions();
            //console.log(availableTransactions[0]);
            const structuredTransactions = availableTransactions.map((transaction) => ({
                addressTo:transaction.receiver,
                addressFrom:transaction.from,
                timestamp:new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
                message:transaction.message,
                keyword:transaction.keyword,
                amount:parseInt(transaction.amount._hex) / (10 ** 18),
            }))
            
            setTransactions(structuredTransactions);
            //console.log(structuredTransactions);
        } catch (error) {
             console.log(error);
        }
    }

    const checkIfwalletIsConnected = async () => {

        try{
            if(!ethereum) return alert("Please install metmask to continue");

            const accounts = await ethereum.request({ method: 'eth_accounts' });

            //console.log(accounts);
            if(accounts.length){
                setCurrentAccount(accounts[0]);
                //console.log(currentAccount);

                getAllTransactions();
            }else{
                 console.log("No account found");
            }
        }
        catch(error){
             console.log(error);

            throw new Error("No ethereum wallet found");
        }
    }

    const checkIfTransactionsExist = async () => {
        try {
            const transactionContract = getEthereumContracts();
            const transactionCount = await transactionContract.getTransactionCount();

            window.localStorage.setItem('transactionCount',transactionCount);

        } catch (error) {
            throw new Error("No ethereum wallet found");
        }
    }

    const connectWallet = async () => {
        try{
            if(!ethereum) return alert("Please install metmask to continue");
            
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

            console.log(accounts);
            setCurrentAccount(accounts[0]);
        }catch(err){
             console.log(err);

            throw new Error("No ethereum wallet found");
        }
    }

    const sendTransaction = async (to,value) => {
        try {
            if (ethereum) {
              const { addressTo, amount, keyword, message } = formData;
              const transactionsContract = getEthereumContracts();
              const parsedAmount = ethers.utils.parseEther(amount);
      
              await ethereum.request({
                method: "eth_sendTransaction",
                params: [{
                  from: currentAccount,
                  to: addressTo,
                  gas: "0x5208",
                  value: parsedAmount._hex,
                }],
              });
      
              const transactionHash = await transactionsContract.addToBlockchain(addressTo, parsedAmount, message, keyword);
      
              setIsLoading(true);
              console.log(`Loading - ${transactionHash.hash}`);
              await transactionHash.wait();
              console.log(`Success - ${transactionHash.hash}`);
              setIsLoading(false);
      
              const transactionsCount = await transactionsContract.getTransactionCount();
      
              setTransactionCount(transactionsCount.toNumber());
              window.location.reload();
            } else {
              console.log("No ethereum object");
            }
          } catch (error) {
            console.log(error);
      
            throw new Error("No ethereum object");
          }
            
    }

    useEffect(() => {
        checkIfwalletIsConnected();
        checkIfTransactionsExist();
    },[]);

    return(
        <TransactionContext.Provider value={{connectWallet,currentAccount,formData,setFormData,sendTransaction,handleChange,transactions,isLoading}}>
            {children}
        </TransactionContext.Provider>
    )
}
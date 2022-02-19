import { useEffect,useState } from "react";

const API_KEY = import.meta.env.VITE_GIPHY_API;

const useFetch = (keyword) => {
    const [gifUrl, setGifUrl] = useState("");

    const fetchGifs = async () => {
        try{
            // console.log(keyword.split(" ").join(""));
            // console.log(API_KEY);
            const response = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=Al7R90uRXqVRM8UsJ7HmnogFccqRDshq&q=${keyword.split(" ").join("")}&limit=1`);
            const data = await response.json();
            // console.log(data.data);
            setGifUrl(data.data[0]?.images?.downsized_medium?.url);
        }
        catch(err){
            console.log(err);
            setGifUrl("https://media4.popsugar-assets.com/files/2013/11/07/832/n/1922398/eb7a69a76543358d_28.gif");
        }
    }

    useEffect(() => {
        if(keyword) fetchGifs();
    }, [keyword]);

    return gifUrl;
}

export default useFetch;
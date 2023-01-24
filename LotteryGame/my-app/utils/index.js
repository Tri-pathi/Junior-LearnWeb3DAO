import axios from "axios";



export const subgraphQuery= async(query)=>{

    try {
        const SUBGRAPH_URL="https://api.thegraph.com/subgraphs/name/tri-pathi/web3tutorial";
        const response=await axios.post(SUBGRAPH_URL,{
            query,
        })
        if(response.data.errors){
            console.log(response.data.errors);
            throw new Error(`Error making subgraph query ${response.data.errors}`);

        }
        return response.data.data;
        
    } catch (error) {
        console.log(error);
        throw new Error(`Could not query the subgraph ${error.message}`);

    }
}
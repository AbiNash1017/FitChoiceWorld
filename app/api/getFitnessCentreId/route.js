import supabase from "@/lib/supabase";
import { cookies } from "next/headers";

export async function GET(req) {
    try {

        const oid = (await supabase.from('Users').select('*').eq('uid', (await supabase.auth.getUser()).data.user.id))[0]
        console.log(oid)
        const fitness_centre = await supabase.from('Fitness_Centres').select().eq('owner_id', oid)
        console.log("errror"+fitness_centre.data)
        if(fitness_centre.data) {
            console.log("errror"+fitness_centre.data)
            // const fitness_centre_id = fitness_centre.data[0].
        }
        return new Response(
                    JSON.stringify({ fitness_centre_id: fitness_centre}),
                    { status: 200 }
                );
    }
    //     const cookieStore = cookies()
    //     const fitnessCentreId = (await cookieStore).get("fitness_centre_id")
    //     console.log("in api,", fitnessCentreId)
    //     if (!fitnessCentreId) {
    //         return new Response(
    //             JSON.stringify({ message: "No fitness_centre_id cookie found" }),
    //             { status: 400 }
    //         );
    //     }
    //     const fitnessCentreIdValue = fitnessCentreId.value
    //     console.log("fc value",fitnessCentreIdValue)
    //     return new Response(
    //         JSON.stringify({ fitness_centre_id: fitnessCentreIdValue }),
    //         { status: 200 }
    //     );
    // } catch (error) {
    //     console.error(error);
    //     return new Response(
    //         JSON.stringify({ message: "Error accessing cookies" }),
    //         { status: 500 }
    //     );
    // }    
    catch (error) {
console.log(error.message)
return new Response(
    JSON.stringify({ message: "Error accessing cookies" }),
)
    }
}

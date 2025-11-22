'use client'

import { getUserSession } from "@/lib/auth";
import supabase from "@/lib/supabase";
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";

// const FitnessCentreContext = createContext<FitnessCentreId | null>({fitnessCentreId: ''});

const FitnessCentreContext = createContext(undefined);

export const FitnessCentreProvider = ({ children }) => {
    const [fitnessCentreId, setFitnessCentreId] = useState(null);
    const [authSession, setAuthSession] = useState(null)
    const router = useRouter()

    const setUserSession = async () => {
        try {
            const userSession = await getUserSession();
            if (!userSession) {
                // router.push('/login'); // Redirect if no session
                return;
            }
            setAuthSession(userSession);
        } catch (error) {
            console.error("Error fetching session:", error);
            router.push('/login');
        }
    };

    useEffect(() => {
        setUserSession()
    }, [])

    useEffect(() => {
        const fetchFitnessCentreId = async () => {
            try {
                if (!authSession) return;

                const uid = (await supabase.auth.getUser()).data.user?.id
                const oid = (await supabase.from('Users').select('*').eq('uid', uid))
                console.log(oid)
                let owner_id;
                if (oid.data && oid.data[0]) {
                    owner_id = oid.data[0].id
                    const { data, error } = await supabase.from('Fitness_Centres').select().eq('owner_id', owner_id)
                    if (error) {
                        console.log(error.message)
                    }
                    if (data && data.length > 0) {
                        setFitnessCentreId(data[0].id);
                    } else {
                        console.log("Fitness Centre ID not found");
                    }
                }
            } catch (error) {
                console.error("Error fetching fitness centre id:", error);
            }
        };

        // if (!fitnessCentreId) {
        //   fetchFitnessCentreId();
        // }

        if (!fitnessCentreId && authSession) {
            fetchFitnessCentreId();
        }

    }, [fitnessCentreId, authSession]);

    return (
        <FitnessCentreContext.Provider value={{ fitnessCentreId }}>
            {children}
        </FitnessCentreContext.Provider>
    );
};

export const useFitnessCentre = () => {
    const context = useContext(FitnessCentreContext);
    if (!context) {
        throw new Error('useFitnessCentre must be used within a FitnessCentreProvider');
    }
    return context;
};

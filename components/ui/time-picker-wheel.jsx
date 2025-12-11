'use client';

import React, { useEffect, useState, useMemo } from 'react';
import WheelPicker from './wheel-picker';

const HOURS = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
// Optimized minutes for booking? Maybe step of 5? 
// "allow users to easily choose available booking slots" -> 15 min intervals is common.
// specific minute might be annoying on a wheel.
// Let's use 5 minute intervals: 00, 05, ... 55.
const MINUTES_5 = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

const PERIODS = ['AM', 'PM'];

const TimePickerWheel = ({ value, onChange }) => {
    // Value format: "HH:mm" 24-hour

    // Parse initial value (supports "HH:mm" 24h OR "hh:mm AA" 12h)
    const parseTime = (timeStr) => {
        if (!timeStr) return { hour: '12', minute: '00', period: 'AM' };

        // Check if 12-hour format with AM/PM
        if (timeStr.toLowerCase().includes('m')) {
            const [time, periodRaw] = timeStr.split(' ');
            const [h, m] = time.split(':').map(Number);
            const period = periodRaw.toUpperCase();
            return {
                hour: h.toString().padStart(2, '0'),
                minute: m.toString().padStart(2, '0'),
                period: period
            };
        }

        // Fallback to 24-hour parsing if needed
        const [h, m] = timeStr.split(':').map(Number);
        const period = h >= 12 ? 'PM' : 'AM';
        let hour = h % 12;
        if (hour === 0) hour = 12;
        return {
            hour: hour.toString().padStart(2, '0'),
            minute: m.toString().padStart(2, '0'),
            period
        };
    };

    const [selected, setSelected] = useState(parseTime(value));

    useEffect(() => {
        if (value) {
            const parsed = parseTime(value);
            // Simple check to prevent loops/unnecessary updates
            if (parsed.hour !== selected.hour || parsed.minute !== selected.minute || parsed.period !== selected.period) {
                setSelected(parsed);
            }
        }
    }, [value]);

    const handleChange = (key, val) => {
        const newSelected = { ...selected, [key]: val };
        setSelected(newSelected); // Optimistic update

        // Output format: "hh:mm AA"
        const hStr = newSelected.hour.toString().padStart(2, '0');
        const mStr = newSelected.minute.toString().padStart(2, '0');
        const pStr = newSelected.period;

        onChange(`${hStr}:${mStr} ${pStr}`);
    };

    // Use MINUTES_5 if the current minute is a multiple of 5, otherwise fallback to full minutes?
    // Or just force 5 min steps for "easy choice". 
    // Let's stick to 5 minute steps for cleaner UI.
    // If the incoming value is "10:03", we might have an issue displaying it.
    // We'll add the value to the list if missing.

    const minutesList = useMemo(() => {
        const list = [...MINUTES_5];
        if (!list.includes(selected.minute)) {
            list.push(selected.minute);
            list.sort();
        }
        return list;
    }, [selected.minute]);

    return (
        <div className="flex items-center justify-center gap-2 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="w-16">
                <WheelPicker
                    items={HOURS}
                    value={selected.hour}
                    onChange={(v) => handleChange('hour', v)}
                />
            </div>
            <span className="text-xl font-bold text-gray-300">:</span>
            <div className="w-16">
                <WheelPicker
                    items={minutesList}
                    value={selected.minute}
                    onChange={(v) => handleChange('minute', v)}
                />
            </div>
            <div className="w-16 ml-2">
                <WheelPicker
                    items={PERIODS}
                    value={selected.period}
                    onChange={(v) => handleChange('period', v)}
                    loop={false}
                />
            </div>
        </div>
    );
};

export default TimePickerWheel;

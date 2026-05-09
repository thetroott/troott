import React from 'react'
import { IAPIReport } from '../utils/interfaces.util'

interface IUseReport {
    browser?: boolean
}

interface IExportToCSV {
    title: string,
    report?: IAPIReport,
    date?: {
        start: string,
        end: string
    }
}

const useReport = () => {

    const exportToCSV = (data: IExportToCSV) => {

        let prefix = '';
        const { title, report, date } = data;

        if (report && report.format && report.format === 'csv' && report.csv) {

            const blob = new Blob([report.csv], { type: 'text/csv;charset=utf-8;' });

            let csvUrl = '';

            csvUrl = window.URL.createObjectURL(blob);

            if (date && date.start && date.end) {
                prefix = `_${date.start}_${date.end}`;
            }

            let link = document.createElement("a");
            link.href = csvUrl;
            link.setAttribute("download", `${title}${prefix}.csv`);
            link.click();

        }

    }

    const downloadSampleCSV = (filename: string) => {

        if (filename) {

            const path = filename.includes('csv') ? `/${filename}` : `/${filename}.csv`;

            const link = document.createElement('a');
            link.href = path;
            link.setAttribute('download', path);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        }

    }

    return { 
        exportToCSV, 
        downloadSampleCSV 
    }

}

export default useReport
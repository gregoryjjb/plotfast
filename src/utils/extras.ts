import { IPoint } from '../modules/Data';

export const generateData = (amount = 500): IPoint[] => {
    let data: IPoint[] = [{ x: 0, y: 0 }];
    for (let i = 1; i < amount; i++) {
        data.push({
            x: i / 3,
            y: Math.round((Math.random() - 0.5) * 10 + data[i - 1].y),
        });
    }
    return data;
};

// Credit to Anatoliy on Stackoverflow
// https://stackoverflow.com/a/1484514
export const getRandomColor = (): string => {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

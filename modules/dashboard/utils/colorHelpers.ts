// labwatch-app/modules/dashboard/utils/colorHelpers.ts
import { Colors, ColorScheme } from '@/constants/Colors'; //
import { AQILevel, TempHumidityData } from '@/types/sensor'; //

export const getStatusColorForDial = (
    status: TempHumidityData['status'] | AQILevel | undefined,
    colorScheme: ColorScheme
): string => {
    const themeColors = Colors[colorScheme];
    switch (status) {
        case 'normal':
        case 'good':
            return themeColors.successText;
        case 'moderate':
            return themeColors.infoText;
        case 'warning':
        case 'unhealthy_sensitive':
            return themeColors.warningText;
        case 'critical':
        case 'unhealthy':
        case 'very_unhealthy':
        case 'hazardous':
            return themeColors.errorText;
        default:
            return themeColors.text;
    }
};
import * as XLSX from 'xlsx';

//Domain
import { ResultPattern } from '@domain/patterns/results';

export class Xlsx {
  static generatedCredentialsExcel = (
    requester: string | null,
    data: {
      email: string;
      password: string;
    },
  ): ResultPattern<ArrayBuffer> =>
    ResultPattern.tryCatch('Infrastructure', Xlsx.name, (): ArrayBuffer => {
      const sheetData = [
        {
          'correo electronico': data.email,
          contraseña: data.password,
        },
      ];

      const worksheet = XLSX.utils.json_to_sheet(sheetData);

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'credenciales');

      workbook.Props = {
        Author: requester ?? undefined,
        CreatedDate: new Date(),
      };

      const buffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });

      return buffer;
    });

  static sheetExcel = (
    requester: string | null,
    sheet: string,
    rows: Array<Array<string | number | null>>,
  ): ResultPattern<ArrayBuffer> =>
    ResultPattern.tryCatch('Infrastructure', Xlsx.name, (): ArrayBuffer => {
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.aoa_to_sheet(rows),
        sheet,
      );

      workbook.Props = {
        Author: requester ?? undefined,
        CreatedDate: new Date(),
      };

      return XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    });
}

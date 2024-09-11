package com.example.quizexam_student.bean.response;

import com.example.quizexam_student.entity.Subject;
import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NoArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.util.IOUtils;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.List;

@NoArgsConstructor
public class SubjectExcelExporter {
    private XSSFWorkbook workbook;
    private XSSFSheet sheet;
    private List<Subject> subjects;

    public SubjectExcelExporter(List<Subject> subjects) {
        this.subjects = subjects;
        workbook = new XSSFWorkbook();
        sheet = workbook.createSheet("Subjects");
    }

    private void writeHeaderRow(){
        Row row = sheet.createRow(0);

        CellStyle style = workbook.createCellStyle();
        XSSFFont font = workbook.createFont();
        font.setBold(true);
        font.setFontHeight(16);
        style.setFont(font);

        Cell cell = row.createCell(0);
        cell.setCellValue("Subject ID");
        cell.setCellStyle(style);

        cell = row.createCell(1);
        cell.setCellValue("Name");
        cell.setCellStyle(style);

        cell = row.createCell(2);
        cell.setCellValue("Semeter");
        cell.setCellStyle(style);

        cell = row.createCell(3);
        cell.setCellValue("Image");
        cell.setCellStyle(style);

    }
    private void writeDataRow() throws IOException {
        int rowCount = 1;
        for (Subject subject : subjects) {
            Row row = sheet.createRow(rowCount++);

            Cell cell = row.createCell(0);
            cell.setCellValue(subject.getId());
            sheet.autoSizeColumn(0);

            cell = row.createCell(1);
            cell.setCellValue(subject.getName());
            sheet.autoSizeColumn(1);

            cell = row.createCell(2);
            cell.setCellValue(subject.getSem().getName());
            sheet.autoSizeColumn(2);

            if (subject.getImage() != null) {
                int pictureIndex = addImageToWorkBook(subject.getImage());
                Drawing<?> drawing = sheet.createDrawingPatriarch();

                ClientAnchor anchor = workbook.getCreationHelper().createClientAnchor();
                anchor.setCol1(3);
                anchor.setRow1(rowCount -1);

                Picture picture = drawing.createPicture(anchor, pictureIndex);
                picture.resize();
            }
        }
    }

    private int addImageToWorkBook(byte[] imageBytes) throws IOException {
        ByteArrayInputStream bis = new ByteArrayInputStream(imageBytes);
        byte[] imageInputBytes = IOUtils.toByteArray(bis);
        int pictureIndex = workbook.addPicture(imageInputBytes, XSSFWorkbook.PICTURE_TYPE_PNG);
        bis.close();
        return pictureIndex;
    }

    public void export(HttpServletResponse response) throws IOException {
        writeHeaderRow();
        writeDataRow();
        ServletOutputStream outputStream = response.getOutputStream();
        workbook.write(outputStream);
        workbook.close();
        outputStream.close();
    }
}
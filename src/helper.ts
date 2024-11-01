import {
  Template,
  Font,
  checkTemplate,
  getInputFromTemplate,
  getDefaultFont,
  DEFAULT_FONT_NAME,
  BLANK_PDF
} from '@pdfme/common';
import { Form, Viewer, Designer } from '@pdfme/ui';
import { generate } from '@pdfme/generator';
import {
  multiVariableText,
  text,
  barcodes,
  image,
  svg,
  line,
  table,
  rectangle,
  ellipse,
  // dateTime,
  // date
  //time,
  // select,
} from '@pdfme/schemas';
import plugins from './plugins';

const fontObjList = [
  // {
  //   fallback: true,
  //   label: 'Apercu-Light',
  //   url: '/fonts/Apercu-Light.otf',
  // },
  // {
  //   fallback: false,
  //   label: 'NotoSansJP-Regular',
  //   url: '/fonts/NotoSansJP-Regular.otf',
  // },
  {
    fallback: true,
    label: 'Apercu-Light',
    url: '/fonts/Apercu-Light.otf',
  },
  {
    fallback: false,
    label: 'Apercu-Regular',
    url: '/fonts/Apercu-Regular.otf',
  },
  {
    fallback: false,
    label: 'Apercu-Bold',
    url: '/fonts/Apercu-Bold.otf',
  },
  {
    fallback: false,
    label: DEFAULT_FONT_NAME,
    data: getDefaultFont()[DEFAULT_FONT_NAME].data,
  },
 
];

export const getFontsData = async () => {
  const fontDataList = (await Promise.all(
    fontObjList.map(async (font) => ({
      ...font,
      data: font.data || (await fetch(font.url || '').then((res) => res.arrayBuffer())),
    }))
  )) as { fallback: boolean; label: string; data: ArrayBuffer }[];

  return fontDataList.reduce((acc, font) => ({ ...acc, [font.label]: font }), {} as Font);
};

export const readFile = (file: File | null, type: 'text' | 'dataURL' | 'arrayBuffer') => {
  return new Promise<string | ArrayBuffer>((r) => {
    const fileReader = new FileReader();
    fileReader.addEventListener('load', (e) => {
      if (e && e.target && e.target.result && file !== null) {
        r(e.target.result);
      }
    });
    if (file !== null) {
      if (type === 'text') {
        fileReader.readAsText(file);
      } else if (type === 'dataURL') {
        fileReader.readAsDataURL(file);
      } else if (type === 'arrayBuffer') {
        fileReader.readAsArrayBuffer(file);
      }
    }
  });
};

const getTemplateFromJsonFile = (file: File) => {
  return readFile(file, 'text').then((jsonStr) => {
    const template: Template = JSON.parse(jsonStr as string);
    checkTemplate(template);
    return template;
  });
};

export const downloadJsonFile = (json: unknown, title: string) => {
  if (typeof window !== 'undefined') {
    const blob = new Blob([JSON.stringify(json)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
};

export const handleLoadTemplate = (
  e: React.ChangeEvent<HTMLInputElement>,
  currentRef: Designer | Form | Viewer | null
) => {
  if (e.target && e.target.files) {
    getTemplateFromJsonFile(e.target.files[0])
      .then((t) => {
        if (!currentRef) return;
        currentRef.updateTemplate(t);
      })
      .catch((e) => {
        alert(`Invalid template file.
--------------------------
${e}`);
      });
  }
};

export const getPlugins = () => {
  return {
    Text: text,
    'Multi-Variable Text': multiVariableText,
    Table: table,
    Line: line,
    Rectangle: rectangle,
    Ellipse: ellipse,
    Image: image,
    SVG: svg,
    Signature: plugins.signature,
    QR: barcodes.qrcode,
    ImageFill: plugins.imageFill,
    //DateTime: dateTime,
    // Date: date,
    //Time: time,
    //Select: select,
  };
};

export const generatePDF = async (currentRef: Designer | Form | Viewer | null) => {
  if (!currentRef) return;
  const template = currentRef.getTemplate();
  // const options = currentRef.getOptions();
  const options = 'getOptions' in currentRef ? (currentRef as any).getOptions() : {};
  const inputs =
    typeof (currentRef as Viewer | Form).getInputs === 'function'
      ? (currentRef as Viewer | Form).getInputs()
      : getInputFromTemplate(template);
  const font = await getFontsData();

  try {
    const pdf = await generate({
      template,
      inputs,
      options: {
        font,
        lang: options.lang,
        title: 'pdfme',
      },
      plugins: getPlugins(),
    });

    const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
    window.open(URL.createObjectURL(blob));
  } catch (e) {
    alert(e + '\n\nCheck the console for full stack trace');
    throw e;
  }
};

export const isJsonString = (str: string) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};

const getInvoiceTemplate = (): Template => ({
  schemas: [
    {
      "logo": {
        "type": "svg",
        "position": {
          "x": 10,
          "y": 10
        },
        "content": "<svg xmlns=\"http://www.w3.org/2000/svg\" id=\"b\" viewBox=\"0 0 91.89 28.83\"><g id=\"c\"><path d=\"m8.33,6.29c0,1-.81,1.82-1.82,1.82s-1.82-.81-1.82-1.82.81-1.82,1.82-1.82,1.82.82,1.82,1.82\" style=\"fill:#231f20;\"/><path d=\"m12.92,6.29c0,1-.82,1.82-1.82,1.82s-1.82-.81-1.82-1.82.81-1.82,1.82-1.82,1.82.82,1.82,1.82\" style=\"fill:#231f20;\"/><path d=\"m17.38,6.29c0,1-.81,1.82-1.82,1.82s-1.82-.81-1.82-1.82.81-1.82,1.82-1.82,1.82.82,1.82,1.82\" style=\"fill:#231f20;\"/><path d=\"m8.33,1.82c0,1-.81,1.82-1.82,1.82s-1.82-.81-1.82-1.82.81-1.82,1.82-1.82,1.82.81,1.82,1.82\" style=\"fill:#231f20;\"/><path d=\"m17.38,1.82c0,1-.81,1.82-1.82,1.82s-1.82-.81-1.82-1.82.81-1.82,1.82-1.82,1.82.81,1.82,1.82\" style=\"fill:#231f20;\"/><path d=\"m12.92,10.77c0,1-.82,1.82-1.82,1.82s-1.82-.81-1.82-1.82.81-1.82,1.82-1.82,1.82.82,1.82,1.82\" style=\"fill:#231f20;\"/><path d=\"m17.38,10.77c0,1-.81,1.82-1.82,1.82s-1.82-.81-1.82-1.82.81-1.82,1.82-1.82,1.82.82,1.82,1.82\" style=\"fill:#231f20;\"/><path d=\"m0,15.57h2.32l1.89,6.5,1.89-6.5h2.32l-3.17,9.33h-2.07L0,15.57Z\" style=\"fill:#231f20;\"/><path d=\"m9.89,15.57h2.3v9.33h-2.3v-9.33Z\" style=\"fill:#231f20;\"/><path d=\"m14.52,15.57h2.3v1.5c.76-1.09,1.72-1.65,2.89-1.65,1.72,0,2.87.98,2.87,2.82v6.67h-2.3v-5.98c0-1.02-.44-1.54-1.33-1.54-1.19,0-2.13,1.44-2.13,3.8v3.72h-2.3v-9.33Z\" style=\"fill:#231f20;\"/><path d=\"m32.02,11.8h1.19v13.11h-1.19v-1.22c-.5.74-1.72,1.37-2.91,1.37-1.31,0-2.33-.44-3.07-1.35-.72-.91-1.09-2.07-1.09-3.46s.37-2.54,1.09-3.44c.74-.91,1.76-1.37,3.07-1.37,1.02,0,2.24.59,2.91,1.46v-5.09Zm-2.85,12.19c1.93,0,3-1.54,3-3.74,0-1.09-.26-1.98-.8-2.69-.52-.7-1.26-1.06-2.2-1.06s-1.69.35-2.22,1.06c-.54.7-.8,1.59-.8,2.69,0,2.2,1.09,3.74,3.02,3.74Z\" style=\"fill:#231f20;\"/><path d=\"m43.8,20.24h-7.04c0,2.22,1.11,3.74,2.94,3.74,1.41,0,2.19-.57,2.87-2l1.02.5c-.94,1.85-2.11,2.57-3.89,2.57-1.24,0-2.24-.44-3-1.35-.76-.91-1.15-2.07-1.15-3.46s.39-2.54,1.15-3.44c.76-.91,1.76-1.37,3-1.37s2.19.39,2.94,1.19c.76.8,1.15,1.83,1.15,3.11v.52Zm-6.96-1.07h5.78c-.22-1.65-1.26-2.67-2.91-2.67-1.5,0-2.56,1.09-2.87,2.67Z\" style=\"fill:#231f20;\"/><path d=\"m47.22,16.3c.65-.57,1.46-.87,2.44-.87.61,0,1.19.13,1.72.41l1.76-.93.91,1.52-1.33.67c.24.43.37.93.37,1.48,0,.94-.33,1.7-.98,2.28-.65.56-1.46.83-2.44.83-.46,0-.93-.07-1.35-.2-.3.17-.44.41-.44.7,0,.46.3.69.87.69h1.91c2,0,3.28.98,3.28,2.74,0,.72-.22,1.33-.65,1.83-.87,1.02-2.11,1.39-3.59,1.39-1.24,0-2.26-.26-3.06-.8-.78-.54-1.17-1.3-1.17-2.28,0-.76.26-1.39.76-1.85-.31-.39-.48-.87-.48-1.44,0-.85.39-1.5,1.15-1.96-.43-.54-.65-1.17-.65-1.93,0-.94.33-1.7.98-2.28Zm1.65,8.5c-.43,0-.78-.02-1.07-.07-.13.2-.2.48-.2.85,0,.87.83,1.33,2.09,1.33s1.95-.39,1.95-1.15c0-.65-.5-.96-1.5-.96h-1.26Zm.8-4.96c.74,0,1.28-.52,1.28-1.26s-.54-1.3-1.28-1.3-1.28.54-1.28,1.3.54,1.26,1.28,1.26Z\" style=\"fill:#231f20;\"/><path d=\"m55.33,18.02c.3-1.56,1.69-2.59,3.56-2.59,2.61,0,3.93,1.3,3.93,3.91v5.57h-1.89l-.24-1.19c-.72.89-1.68,1.33-2.87,1.33-1.65,0-2.83-1.04-2.83-2.83s1.61-3.06,3.98-3.06h1.56v-.41c0-.91-.54-1.37-1.63-1.37-.83,0-1.37.35-1.61,1.07l-1.95-.44Zm3.02,5.07c.57,0,1.07-.19,1.5-.54.44-.35.67-.81.67-1.39v-.18h-1.54c-1.06,0-1.59.41-1.59,1.2,0,.5.35.91.96.91Z\" style=\"fill:#231f20;\"/><path d=\"m67.31,24.91h-2.3v-9.33h2.3v1.52c.67-1.06,1.67-1.67,2.76-1.67.35,0,.72.06,1.13.19l-.43,2.13c-.28-.17-.61-.26-.96-.26-1.46,0-2.5,1.28-2.5,4.11v3.31Z\" style=\"fill:#231f20;\"/><path d=\"m78.7,16.43v-4.63h2.3v13.11h-2.3v-.96c-.3.54-1.2,1.11-2.26,1.11-2.74,0-4.26-1.87-4.26-4.81s1.52-4.82,4.26-4.82c.91,0,1.83.46,2.26,1Zm-4.11,3.82c0,.89.2,1.59.61,2.09.41.5.93.76,1.56.76s1.15-.24,1.54-.74c.41-.5.61-1.2.61-2.11s-.2-1.59-.61-2.09c-.39-.5-.91-.76-1.54-.76s-1.15.26-1.56.76c-.41.5-.61,1.2-.61,2.09Z\" style=\"fill:#231f20;\"/><path d=\"m91.89,20.98h-6.43c.06,1.13.87,2.11,2.2,2.11.94,0,1.7-.48,2.26-1.44l1.85.69c-.8,1.82-2.2,2.72-4.24,2.72-3.2,0-4.48-2.59-4.48-4.81s1.28-4.82,4.48-4.82c1.48,0,2.68.61,3.35,1.56.67.91,1,2,1,3.06v.94Zm-6.37-1.81h4.02c-.26-1.19-.93-1.78-2-1.78s-1.85.8-2.02,1.78Z\" style=\"fill:#231f20;\"/></g></svg>",
        "width": 29,
        "height": 9,
        "readOnly": true
      },
      "companyDetails": {
        "type": "multiVariableText",
        "position": {
          "x": 132,
          "y": 10
        },
        "content": "{\"CompanyName\":\"Vin de Garde wine cellars Inc.\",\"CompanyAddress\":\"1-1575 Pemberton Ave Squamish, BC V8B 0G8\",\"CompanyTax\":\"RC00018487498479\"}",
        "width": 30,
        "height": 25,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1.1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "text": "{CompanyName}\n{CompanyAddress}\n\n\n{CompanyTax}",
        "variables": [
          "CompanyName",
          "CompanyAddress",
          "CompanyTax"
        ],
        "fontName": "Apercu-Light"
      },
      "companyContactInfo": {
        "type": "multiVariableText",
        "position": {
          "x": 168,
          "y": 10
        },
        "content": "{\"CompanyPhone\":\"Tel: (913) 999 9999\",\"CompanyEmail\":\"info@vindegarde.ca\",\"CompanyWeb\":\"www.vindegarde.ca\"}",
        "width": 30,
        "height": 10,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1.1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "text": "{CompanyPhone}\n{CompanyEmail}\n{CompanyWeb}",
        "variables": [
          "CompanyPhone",
          "CompanyEmail",
          "CompanyWeb"
        ],
        "fontName": "Apercu-Light"
      },
      "headingH1": {
        "type": "text",
        "position": {
          "x": 45,
          "y": 40
        },
        "content": "Invoice",
        "width": 69,
        "height": 12,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 24,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#000000",
        "backgroundColor": "",
        "opacity": 1,
        "readOnly": true,
        "fontName": "Apercu-Bold",
        "required": false
      },
      "infoLabels": {
        "type": "text",
        "content": "Invoice Number:\nInvoice date:\nDue date:\n\nProject name:",
        "position": {
          "x": 45,
          "y": 57
        },
        "width": 35,
        "height": 35,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 2,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "fontName": "Apercu-Regular",
        "readOnly": false
      },
      "infoInput": {
        "type": "multiVariableText",
        "content": "{\"InvoiceNo\":\"12345\",\"InvoiceDate\":\"16 June 2025\",\"DueDate\":\"16 June 2025\",\"ProjectName\":\"Wilmar Heritage Home\"}",
        "position": {
          "x": 80,
          "y": 57
        },
        "width": 35,
        "height": 35,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 2,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "text": "{InvoiceNo}\n{InvoiceDate}\n{DueDate}\n\n{ProjectName}",
        "variables": [
          "InvoiceNo",
          "InvoiceDate",
          "DueDate",
          "ProjectName"
        ],
        "fontName": "Apercu-Light"
      },
      "billAddressLabel": {
        "type": "text",
        "position": {
          "x": 132,
          "y": 57
        },
        "content": "Bill to address:",
        "width": 30,
        "height": 9,
        "rotate": 0,
        "alignment": "right",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "readOnly": true,
        "fontName": "Apercu-Regular",
        "required": false
      },
      "billingInfoInput": {
        "type": "multiVariableText",
        "position": {
          "x": 167,
          "y": 57
        },
        "content": "{\"BillingName\":\"Cecconi Simone Inc.\",\"BillingAddress\":\"1335 Dundas St. West Toronto, Ontario, Canada M6J 1Y3\",\"BillingPhone\":\"416 588 5900\"}",
        "width": 33,
        "height": 33,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1.1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "text": "{BillingName}\n{BillingAddress}\n{BillingPhone}",
        "variables": [
          "BillingName",
          "BillingAddress",
          "BillingPhone"
        ],
        "fontName": "Apercu-Light"
      },
      "orderTable": {
        "type": "table",
        "position": {
          "x": 45,
          "y": 100
        },
        "width": 155,
        "height": 36.4672,
        "content": "[[\"XY Brushed - Per Pair\",\"x288\",\"$9.02\",\"$2,600.00\"],[\"Panel 78”W x 84” H (52 Sqft)\",\"x2\",\"$1000.00\",\"$2000.00\"]]",
        "showHead": true,
        "head": [
          "Description",
          "Quantity",
          "Unit Price",
          "Extened price"
        ],
        "headWidthPercentages": [
          34.45768053351606,
          21.793475754585593,
          23.134517336186747,
          20.614326375711606
        ],
        "fontName": "Apercu-Light",
        "tableStyles": {
          "borderWidth": 0,
          "borderColor": "#191818"
        },
        "headStyles": {
          "fontName": "Apercu-Regular",
          "fontSize": 8,
          "characterSpacing": 0,
          "alignment": "left",
          "verticalAlignment": "middle",
          "lineHeight": 1,
          "fontColor": "#191818",
          "borderColor": "#EAE9E8",
          "backgroundColor": "",
          "borderWidth": {
            "top": 0.1,
            "right": 0,
            "bottom": 0,
            "left": 0
          },
          "padding": {
            "top": 3,
            "right": 5,
            "bottom": 3,
            "left": 0
          }
        },
        "bodyStyles": {
          "fontName": "Apercu-Light",
          "fontSize": 8,
          "characterSpacing": 0,
          "alignment": "left",
          "verticalAlignment": "middle",
          "lineHeight": 1,
          "fontColor": "#191818",
          "borderColor": "#EAE9E8",
          "backgroundColor": "",
          "alternateBackgroundColor": "",
          "borderWidth": {
            "top": 0.1,
            "right": 0,
            "bottom": 0,
            "left": 0
          },
          "padding": {
            "top": 6,
            "right": 5,
            "bottom": 5,
            "left": 0
          }
        },
        "columnStyles": {
          "alignment": {
            "left": "left"
          }
        },
        "readOnly": false
      },
      "discountLabel": {
        "type": "text",
        "position": {
          "x": 136,
          "y": 140
        },
        "content": "Discounts",
        "width": 28,
        "height": 4,
        "rotate": 0,
        "alignment": "right",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "readOnly": true,
        "fontName": "Apercu-Light",
        "required": false
      },
      "subtotalLabel": {
        "type": "text",
        "position": {
          "x": 136,
          "y": 145
        },
        "content": "Subtotal",
        "width": 28,
        "height": 4,
        "rotate": 0,
        "alignment": "right",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "readOnly": true,
        "fontName": "Apercu-Light",
        "required": false
      },
      "shippingLabel": {
        "type": "text",
        "position": {
          "x": 119,
          "y": 150
        },
        "content": "Curbside shipping & crating",
        "width": 45,
        "height": 4,
        "rotate": 0,
        "alignment": "right",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "readOnly": true,
        "fontName": "Apercu-Light",
        "required": false
      },
      "taxLabel": {
        "type": "text",
        "position": {
          "x": 136,
          "y": 155
        },
        "content": "Tax (0%)",
        "width": 28,
        "height": 4,
        "rotate": 0,
        "alignment": "right",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "readOnly": true,
        "fontName": "Apercu-Light",
        "required": false
      },
      "paidLabel": {
        "type": "text",
        "position": {
          "x": 136,
          "y": 160
        },
        "content": "Paid",
        "width": 28,
        "height": 4,
        "rotate": 0,
        "alignment": "right",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "readOnly": true,
        "fontName": "Apercu-Light",
        "required": false
      },
      "discountInput": {
        "type": "text",
        "content": "-$500",
        "position": {
          "x": 168,
          "y": 140
        },
        "width": 30,
        "height": 4,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "fontName": "Apercu-Light",
        "readOnly": false
      },
      "subtotalInput": {
        "type": "text",
        "content": "$500",
        "position": {
          "x": 168,
          "y": 145
        },
        "width": 30,
        "height": 4,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "fontName": "Apercu-Light",
        "readOnly": false
      },
      "shippingInput": {
        "type": "text",
        "content": "$500",
        "position": {
          "x": 168,
          "y": 150
        },
        "width": 30,
        "height": 4,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "fontName": "Apercu-Light",
        "readOnly": false
      },
      "taxInput": {
        "type": "text",
        "content": "$0",
        "position": {
          "x": 168,
          "y": 155
        },
        "width": 30,
        "height": 4,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#000000",
        "backgroundColor": "",
        "opacity": 1,
        "fontName": "Apercu-Light",
        "readOnly": false
      },
      "paidInput": {
        "type": "text",
        "content": "$0.00",
        "position": {
          "x": 168,
          "y": 160
        },
        "width": 30,
        "height": 4,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#000000",
        "backgroundColor": "",
        "opacity": 1,
        "fontName": "Apercu-Light",
        "readOnly": false
      },
      "totalLabel": {
        "type": "text",
        "position": {
          "x": 136,
          "y": 165
        },
        "content": "Due",
        "width": 28,
        "height": 7,
        "rotate": 0,
        "alignment": "right",
        "verticalAlignment": "top",
        "fontSize": 16,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "fontName": "Apercu-Regular",
        "backgroundColor": "",
        "opacity": 1,
        "readOnly": true,
        "required": false
      },
      "totalInput": {
        "type": "text",
        "content": "$500",
        "position": {
          "x": 168,
          "y": 165
        },
        "width": 30,
        "height": 7,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 16,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "fontName": "Apercu-Regular",
        "readOnly": false
      },
      "line": {
        "type": "line",
        "position": {
          "x": 45,
          "y": 185
        },
        "width": 155,
        "height": 0.1,
        "rotate": 0,
        "opacity": 1,
        "readOnly": true,
        "color": "#EAE9E8"
      },
      "thankyou": {
        "type": "text",
        "position": {
          "x": 168,
          "y": 200
        },
        "content": "Thank you!",
        "width": 30,
        "height": 10,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 16,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#C5BEB9",
        "fontName": "Apercu-Light",
        "backgroundColor": "",
        "opacity": 1,
        "readOnly": true,
        "required": false
      },
      "shippingAddressLabel": {
        "type": "text",
        "position": {
          "x": 45,
          "y": 189
        },
        "content": "Shipping address:",
        "width": 84,
        "height": 4,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "readOnly": true,
        "fontName": "Apercu-Regular",
        "required": false
      },
      "shippingAddressInput": {
        "type": "multiVariableText",
        "position": {
          "x": 45,
          "y": 194
        },
        "content": "{\"ContactName\":\"Maral Mirzaei\",\"CompanyName\":\"Cecconi Simone Inc.\",\"Address\":\"1335 Dundas St. West Toronto, Ontario, Canada M6J 1Y3\",\"Email\":\"hi@cecconi.com\",\"Phone\":\"416 588 5900\"}",
        "width": 35,
        "height": 27,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1.1,
        "characterSpacing": 0,
        "fontColor": "#000000",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "text": "{ContactName}\n{CompanyName}\n{Address}\n\n{Email}\n{Phone}",
        "variables": [
          "ContactName",
          "CompanyName",
          "Address",
          "Email",
          "Phone"
        ],
        "fontName": "Apercu-Light"
      },
      "deliveryNote": {
        "type": "text",
        "position": {
          "x": 45,
          "y": 223
        },
        "content": "Upon delivery the receiver is responsible for checking the items for any damages caused during shipping before the delivery is signed for. Should the receiver suspect any damages on part of shipping, please do not accept the package.",
        "width": 122.78,
        "height": 7.56,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 6,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#6D6E71",
        "backgroundColor": "",
        "opacity": 1,
        "readOnly": true,
        "fontName": "Apercu-Light",
        "required": false
      },
      "notes": {
        "type": "text",
        "content": "*All amounts shown are in USD Dollars.\n\n*US Customers: Brokerage not included. Local taxes and duties not included.",
        "position": {
          "x": 45,
          "y": 140
        },
        "width": 51.91,
        "height": 20,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1.1,
        "characterSpacing": 0,
        "fontColor": "#C5BEB9",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": false,
        "fontName": "Apercu-Light"
      },
      "field28": {
        "type": "line",
        "position": {
          "x": 44,
          "y": 136.79
        },
        "width": 155.87,
        "height": 0.01,
        "rotate": 0,
        "opacity": 1,
        "readOnly": true,
        "color": "#EAE9E8",
        "required": false
      }
    }
  ],
  basePdf: {
    width: 210, height: 297,
    padding: [10, 10, 10, 10],
  },
  pdfmeVersion: '4.0.0',
});
  // ({ schemas: [{}], basePdf: { width: 215.9, height: 279.4, padding: [10, 10, 10, 10] } } as Template);
  const getBlankTemplate = (): Template => ({
    schemas: [
      {"projectTitle1": {  // Main field
      "type": "text",
      "position": { "x": 10, "y": 43 },
      "content": "Page {pageNum} of {pageCount}",
      "width": 120,
      "height": 10,
      "fontSize": 24,
      "fontColor": "#EAE9E8",
      "fontName": "Apercu-Bold",
      "readOnly": false
    },
   
      },
      { "projectTitle2": {  // Second instance of project title
        "type": "text",
        "position": { "x": 10, "y": 150 },
        "content": "Page {pageNum} of {pageCount}",
        "width": 80,
        "height": 8,
        "fontSize": 16,
        "fontColor": "#191818",
        "fontName": "Apercu-Regular",
        "readOnly": true  // Only the main field should be editable
      }},
    ],
   basePdf:{
    width:210,
    height:297,
    padding:[10,10,10,10]},
    pageCount: 0, // New property to track the number of pages
    autoPaging: true,
   pdfmeVersion: "4.0.0",
  });

const getProposalTemplate = (): Template => ({
  schemas: [
    {
      "p1-bg-black": {
        "type": "rectangle",
        "position": {
          "x": 0,
          "y": 0
        },
        "width": 210,
        "height": 297,
        "rotate": 0,
        "opacity": 1,
        "borderWidth": 0,
        "borderColor": "",
        "color": "#191818",
        "readOnly": true,
        "required": false
      },
      "p1-headerLogo": {
        "type": "image",
        "position": {
          "x": 10,
          "y": 10
        },
        "width": 38,
        "height": 12,
        "content": "data:image/png;base64,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",
        "readOnly": true,
        "required": false
      },
      "date": {
        "type": "text",
        "position": {
          "x": 175,
          "y": 10
        },
        "content": "February 10, 2020",
        "width": 25,
        "height": 3,
        "fontSize": 8,
        "fontColor": "#EAE9E8",
        "alignment": "right",
        "fontName": "Apercu-Light",
        "readOnly": false
      },
      "p1-projectProposalLabel": {
        "type": "text",
        "position": {
          "x": 10,
          "y": 130
        },
        "content": "Project Proposal",
        "width": 32,
        "height": 5,
        "fontSize": 12,
        "fontColor": "#EAE9E8",
        "fontName": "Apercu-Light",
        "readOnly": true,
        "backgroundColor": "",
        "required": false
      },
      "p1-titleInput": {
        "type": "text",
        "position": {
          "x": 10,
          "y": 149
        },
        "content": "Willmar Heritage Home,",
        "width": 120,
        "height": 10,
        "fontSize": 24,
        "fontColor": "#EAE9E8",
        "fontName": "Apercu-Bold",
        "readOnly": false
      },
      "p1-clientNameInput": {
        "type": "text",
        "position": {
          "x": 10,
          "y": 159
        },
        "content": "Cecconi Simone Inc.",
        "width": 120,
        "height": 10,
        "fontSize": 24,
        "fontColor": "#EAE9E8",
        "fontName": "Apercu-Bold",
        "readOnly": false
      },
      "p1-companyAddress": {
        "type": "text",
        "position": {
          "x": 10,
          "y": 190
        },
        "content": "Vin de Garde Wine Cellars Inc.\n1-575 Pemberton Avenue,\nSquamish, British Columbia\nCanada V8B 0G8",
        "width": 68,
        "height": 25,
        "fontSize": 8,
        "lineHeight": 1.5,
        "fontColor": "#EAE9E8",
        "fontName": "Apercu-Light",
        "readOnly": false
      },
      "p1-contactInfo1": {
        "type": "text",
        "position": {
          "x": 85,
          "y": 190
        },
        "content": "Billy Carpenter\n(915) 999 9999\nb.carpenter@vindegarde.ca\nvindegarde.ca",
        "width": 68,
        "height": 25,
        "fontSize": 8,
        "lineHeight": 1.5,
        "fontColor": "#EAE9E8",
        "fontName": "Apercu-Light",
        "readOnly": false
      },
      "p1-contactInfo2": {
        "type": "text",
        "position": {
          "x": 10,
          "y": 219
        },
        "content": "Cecconi Simone Inc.\n1335 Dundas St. West\nToronto, Ontario, \nCanada M6J 1Y3\n416 588 5900",
        "width": 68,
        "height": 25,
        "fontSize": 8,
        "lineHeight": 1.5,
        "fontColor": "#EAE9E8",
        "fontName": "Apercu-Light",
        "readOnly": false
      },
      "p1-footerLogo": {
        "type": "image",
        "position": {
          "x": 10,
          "y": 266
        },
        "width": 8,
        "height": 8,
        "content": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFQAAABUCAYAAAAcaxDBAAAACXBIWXMAACxKAAAsSgF3enRNAAAFKUlEQVR4nO2bT0wbRxTGX6oc7eaM1VZapzZJe2kICC5t2qgWt7YHEHcQZxBnEOSEkFDVyLJkKWrTSFFDVITEERHAkIONIW0PtgE7bYSNzHXX7n16QKb24l3Pn2/rFZ2ftIdF2vfeft7defPNcIMxliINip9vEtGDbldxjUi91+0KrhtaUDBaUDBaUDBaUDBaUDBaUDBaUDBaUDBaUDBaUDBaUDBaUDBaUDCeCWpZNcrsH3gVXorM/gFZVs3bJAzIabnCZufmmWGEGRFdHrHYMIsnksw0LWS6jpimxeKJJIvFhlvqMYwwm52bZ6flCjrlAkzQ1bX1K0LaD8MIs1y+gErpSi5f4KpndW0dmRYj6Mbmlmvh/7WoPGI2HxubW6jU6oKapiVUPBGxkdExRPGOjIyOCdVjGGHU50hd0HgiKVS8B09FCyJvS/MRTyQR6ReUR/nd1I7Uda/39lRTQ+PK3ocdZUFXf30pdV21WlVNDY0rex92dGMPRllQwwgj6ug6qPtQFvSbb7+Tuu7zL7zZXyEbV/Y+rqA6rKUzWalR1YNZCmPsYrYmU086k0WkxzT2U9Mz3WhRHBFt5cYnJlGpMYKapsXdTM/OzSNSdmR2bp57kgH0GDCCMnYh6uLSsutsxOsn0048kXSdxS0uLaMNm4UbjDEm8+11olw5o+2dXfrzbYmq1SpFor0UiUTo64df0q1b7yNTcWFZNXq1naJSqUSl4gmFQiG6/XGEHn71gD768AN0ukdwQf/nPNKNPZibXgVuduuHBgek4+QLR1Sv/01ERHfv9Ep/NlD1dAT5Rc7lC21bKFGHvOG0txtQxicmuXtGpxUEImJT0zNe+LK4UX51bb1ji2IY4Y62Ha85vLi07BpnY3OLK44vHXseMZsPpyfstFwRMqudRBWdvQFFVRdUVASii0W7doxPTArFcfpx7ItyPG8OaCqsLqhbMy/yVOTyBak4U9MzLXFE3xbeTwgn6o79m0O5tfc/fv+t5XwnJee0P/7he9e4vMjehx3fOPZvS0XpGsqVM8e4vFw7x75er3flWjTKgsZiw4g66F7ffelrP/3krnJ+1H0oCzo4NCR1nd1Zj0YjUnFGRsdc4/Iiex9XUB3WZBx7p40Fou0OtekWZDZekEP7JYF628QYv5nbOJ4+e942jugmBSen/emz50JxgKY3RlDTtLib8k7F8/aRnZx23h95fGLSn449Y+4OeSw2zL39Jp3Jur7+vE77xuaWYxyPVhDwjr1l1Wj/4JCKxdLl3/rv90lZZvnCUUvD39PTI+X8Z/YP6PDNvw1/NBqhwYF+L1YQtGMPRjv2aDxz7BFYVo2Ojk8uz4PBgFQTb48TCvV4sUB3AfqrjKDhtJPD4MbrX+byBcfuY2R0DNV7NoMd5RGkM1muxhzVfoFsuwb+ElR0b7yTqKITBGD75C9BEY697NQT5dj7ZpTPF47opx+fCF+3srLScv5qO0Xv3v0lHOeXF9fMD0U59q/3dqXi+MaxR4Fy7GXNZu3Y+xTfCKri2Dc36cFgUCqGbxx7FLKO/dT0TMv5Z/f6pOL4xrFHIuPY2y3BbrdNvhJUdDnFvsmhgehmB+BsyV+CMsYvRiennTcOeM+//wRlzN3UEHHa05ms4z9TiJgsAuAdeyTlyhkdnxSpWCxRIBCgO71Raef/+KRE5+fnFAgEaKC/D7KW3wbt2IPRjj0aLSgYLSgYLSgYLSgYLSgYLSgYLSgYLSgYLSgYLSgYLSgYLSgYLSgYLSiYfwDbaVNfjwbHgwAAAABJRU5ErkJggg==",
        "readOnly": true,
        "required": false
      },
      "p1-footerTagline": {
        "type": "text",
        "position": {
          "x": 85,
          "y": 264
        },
        "content": "wine, science and design",
        "width": 115,
        "height": 10,
        "fontSize": 24,
        "fontColor": "#C5BEB9",
        "alignment": "left",
        "fontName": "Apercu-Light",
        "readOnly": true,
        "required": false
      },
      "p1-footerDisclaimer": {
        "type": "text",
        "position": {
          "x": 10,
          "y": 278
        },
        "content": "This document is property of Vin de Garde wine cellars Inc. and is strictly confidential. It contains information intended solely for those working on the development of this project. Copyright 2024 Vin de Garde wine cellars Inc.",
        "width": 122,
        "height": 8.5,
        "fontSize": 6,
        "lineHeight": 2,
        "fontColor": "#EAE9E8",
        "fontName": "Apercu-Light",
        "readOnly": true,
        "required": false
      }
    },
    {
      "p2-bg-grey": {
        "type": "rectangle",
        "position": {
          "x": 0,
          "y": 0
        },
        "width": 210,
        "height": 297,
        "rotate": 0,
        "opacity": 1,
        "borderWidth": 0,
        "borderColor": "",
        "color": "#EAE9E8",
        "readOnly": true,
        "required": false
      },
      "headerLogo": {
        "type": "image",
        "position": {
          "x": 10,
          "y": 10
        },
        "width": 29,
        "height": 9,
        "content": "data:image/png;base64,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",
        "readOnly": true,
        "required": false
      },
      "headerContact": {
        "type": "text",
        "position": {
          "x": 85,
          "y": 10
        },
        "content": "Tel: (913) 999 9999\nforms@vindegarde.ca\nwww.vindegarde.ca",
        "width": 30,
        "height": 9,
        "fontSize": 8,
        "fontColor": "#191818",
        "alignment": "left",
        "fontName": "Apercu-Light",
        "readOnly": false
      },
      "client-name": {
        "type": "text",
        "content": "Cecconi Simone",
        "position": {
          "x": 135,
          "y": 10
        },
        "width": 30,
        "height": 3,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": false,
        "fontName": "Apercu-Light"
      },
      "date": {
        "type": "text",
        "content": "February 10, 2020",
        "position": {
          "x": 135,
          "y": 13
        },
        "width": 30,
        "height": 3,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": false,
        "fontName": "Apercu-Light"
      },
      "proposal-version": {
        "type": "text",
        "content": "Proposal v.01",
        "position": {
          "x": 167,
          "y": 10
        },
        "width": 33,
        "height": 3,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": false,
        "fontName": "Apercu-Light"
      },
      "proposal-page-num": {
        "type": "text",
        "content": "Page 2 / 7",
        "position": {
          "x": 167,
          "y": 13
        },
        "width": 33,
        "height": 3,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": false,
        "fontName": "Apercu-Light"
      },
      "p2-dear": {
        "type": "text",
        "position": {
          "x": 47,
          "y": 50
        },
        "content": "Dear",
        "width": 6,
        "height": 3,
        "fontSize": 8,
        "fontColor": "#191818",
        "fontName": "Apercu-Light",
        "readOnly": true,
        "backgroundColor": "",
        "characterSpacing": 0
      },
      "p2-client-name": {
        "type": "text",
        "position": {
          "x": 54,
          "y": 50
        },
        "content": "{clientName}",
        "width": 20,
        "height": 3,
        "fontSize": 8,
        "fontColor": "#191818",
        "fontName": "Apercu-Light",
        "readOnly": false,
        "backgroundColor": "",
        "characterSpacing": 0
      },
      "p2-body": {
        "type": "text",
        "position": {
          "x": 47.21,
          "y": 66.17
        },
        "content": "Thank you for considering Vin de Garde Cellar Systems Inc. for the ‘Wilmar Heritage Home’ wine cellar project. To assist you in designing a world-class wine cellar worthy of being a centrepiece in your client’s residence, we would like to offer you the following proposal. Having completed similar projects in Vancouver, New York, Beverly Hills and in Dubai, luxury, temperature controlled wine rooms with a transitional modern aesthetic is our specialty. We propose to bring together a palette of modern materials and designs for the Wilmar Heritage Home wine cellar, detailed with elegance and style. \n\nOriginality eschews tradition, which is why every Vin de Garde Cellar Systems, Inc.’s custom wine cellar is more than the pastiche of existing designs. Through innovation, science and experience, our team of professionals transform each idea into a timeless design and work of art. \n\nSince 2004, Vin de Garde has been proud to align itself with the world’s leading architecture and design firms that shape the world and future of design. We cater to an exclusive market where customers value absolute luxury and perfection. Vin de Garde Cellar Systems is located in Squamish, British Columbia, with a distribution center in Vancouver, British Columbia. With over a decade of experience designing and building bespoke wine cellars, \nVin de Garde Cellar Systems has mastered the art of transforming spaces into full-on wine cellar experiences. We pride ourselves on designing, building and assembling some of the world’s finest modern style wine cellars in luxury residences, hotel projects and fine dining restaurants around the world. \n\nClient experience is of utmost importance to us, which is why our team works with each client to design a stunning concept that meets their aesthetic and wine storage needs, and then transform it into reality. Our experience as a multi-disciplinary design and fabrication company, focused exclusively on modern wine cellar creation, allows us to integrate the fundamentals of industrial design, engineering, architecture and education in fine wines to deliver unmatched luxury wine cellar environments, storage products and modern furniture. \n\nWe look forward to potentially working together on this project. \n\nPlease review this proposal that I have prepared for you and your team. Should you have any questions, please do not hesitate to contact me.",
        "width": 115.34,
        "height": 146.98,
        "fontSize": 8,
        "lineHeight": 1.4,
        "fontColor": "#191818",
        "fontName": "Apercu-Light",
        "readOnly": false
      },
      "p2-sig": {
        "type": "image",
        "content": "data:image/png;base64,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",
        "position": {
          "x": 47,
          "y": 222
        },
        "width": 23,
        "height": 15,
        "rotate": 0,
        "opacity": 1,
        "required": false,
        "readOnly": false
      },
      "p2-signature": {
        "type": "text",
        "content": "Sincerely,",
        "position": {
          "x": 47,
          "y": 245
        },
        "width": 38,
        "height": 4,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": false,
        "fontName": "Apercu-Light"
      },
      "p2-billy": {
        "type": "text",
        "position": {
          "x": 47,
          "y": 254
        },
        "content": "Billy Carpenter",
        "width": 38,
        "height": 4,
        "fontSize": 8,
        "lineHeight": 1.25,
        "fontColor": "#191818",
        "fontName": "Apercu-Regular",
        "readOnly": false
      },
      "p2-principal": {
        "type": "text",
        "content": "Principal",
        "position": {
          "x": 47,
          "y": 258
        },
        "width": 38,
        "height": 4,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": false,
        "fontName": "Apercu-Light"
      },
      "p2-contact": {
        "type": "text",
        "position": {
          "x": 135,
          "y": 254
        },
        "content": "(915) 999 9999\nb.carpenter@vindegarde.ca\nvindegarde.ca",
        "width": 42,
        "height": 11,
        "fontSize": 8,
        "lineHeight": 1.25,
        "fontColor": "#191818",
        "fontName": "Apercu-Light",
        "readOnly": false
      },
      "p2-footerLogo": {
        "type": "image",
        "position": {
          "x": 10,
          "y": 279
        },
        "width": 8,
        "height": 8,
        "content": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFQAAABUCAYAAAAcaxDBAAAACXBIWXMAACxKAAAsSgF3enRNAAAFCUlEQVR4nO2aT2gbRxTGX0puVXSNZMWn7MZuT3GaP7c6thsWQdubhO4SOtv4aoOPCaQ0IASiJFAKgdJijE/BwTjrnKwqsXOxVCL1ot2E9Ljb9Dw9pJItaVfamXkTjZX3gwHJMG/efuvVvPftnAOABwBwFQgUzsMHMefHncik8Nm4E5g0SFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkzqsMni8UAQDg0cOfVC4TmUw2B/F4HPbtZ9BqNZWtYwMAwxpr6xvsuN5g/RzXG2xtfQNtnagjXyiyp7t7A/m0HZfdvXdfxZo4ghqGGZh4PwfVGjMM86OI+fMvj0fmc1xvMMtK6yfoQbU2MvnTF6GDmB3ajot5k+UFvXvvfuTkO5TKFWVi5gtF7nw2t7b1EbTtuNwX4Hm+MkGj/PQEgfHoS5dNmWwOpi+luOfF4xe6VQA2d5YWhOYtLC5Jry0taCrFL2aHZHJKdvkBZG7S57GY9PrSgiYSSeG5FxMJ2eW1Q1rQZvO18NxXR4eyyw/gOg56TB6kBd23n41lbhg7O0/Acd8IzcW6wTZI7mybW9vcO+rT3T1lu3ypXOHOp+24+pRNlpVmnudHTt7zfOzupGcYhhnY/g5jeWVVH0EBgGWyuUiiep6Pmbx0PowxbI8BzxzJZHNDW9CDao1lsjnlYp7+Tx1W5LcdF/3mnvtf0HlAJJPNwdfzt3v+9nzfht9/+xVzmchYVhoWFpd66sy/Wk148OMP6GspEfRThhx7ZJQ59h13HADA933hx90wTJi/fdKbi7r/lpWGS9PT0vlEwQbEH+VSuRLoPrUdl8uyyxeKoRvc5tZ25LJreWU1sITyPJ+VyhUVZjeeYx+l9juuN0ZeRBRzOEr5FaXhaDsuduWBIyhPIT1MVJ4ux/P8UDF4ujfkRkNeUJFWL+jxt6w0d5yglnF5ZZU7zkG1po+gPG1nhyDHXsQTYGywbeR5v3UaLRz7fKEI8fgF7nlBjv2N618J5XB17lrP91s3rwvF0cKxl3HdTfNKz3eRVykAALMzJ3HOvGMfk0gC4wJ0QyvH3vf/EYrz5u3b7mcVpjUPWjn21doLoThHh0fdz61WU9ixf75vC83rxwbJnU1kdw46WCByQMHz/IGadm19gzsO4mkWeUENw+R27MMKe95DCmHdEq9jj9gtfXzHfljyPK8vhjntWHHGJijAh05n2OPPY2qUypXQG9R2XJYvFCM9OcN8ARVvEJQYzJaVhhs3b3UPMvz97h3U/qjCzs4T7ljLK6tw2TC730Wcf8Mw4dvvvu/G+ff9e3j58oUSC48ce2TIsUdG6Rl7DDLZHKRSKbhsmPDq6BBcxxH66cgXipBMTkEsFoNm87XSc/Y2IP4oY4219Y3Qc6c8m0nYGwTeTZJj6Cdo1EZhVNkUxcYbVcadeUF5zsYzxkLLJx5PFFlUfQQVaT2DHHuR1lMrxx5riDr2/Y8+b9vZAeO/VKuy6ZtFsbPxc9fmup8Nw4Qvv5gVitN/fEgErQQVeZUCAJCaOnlrcPpQxDjQStBJQCtBybFHZndPTIx+x77e+FMojjaOPdagsknBoMJewcBqPaPUoxPfenYGpjkS5vyrMEe0N5gz2RzMzMzCxUQCxb7rxFFl32kv6FlDq7JpEiBBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkfkPP+26e/ySvs0AAAAASUVORK5CYII=",
        "readOnly": true,
        "required": false
      },
      "p2-footer_tag": {
        "type": "text",
        "position": {
          "x": 135.06,
          "y": 280.92
        },
        "content": "wine, science and design",
        "width": 68,
        "height": 6,
        "fontSize": 16,
        "fontColor": "#C5BEB9",
        "alignment": "left",
        "fontName": "Apercu-Light",
        "readOnly": true,
        "required": false
      }
    },
    {
      "p3-img-top": {
        "type": "image",
        "content": "data:image/png;base64,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",
        "position": {
          "x": 0,
          "y": 0
        },
        "width": 210,
        "height": 148.5,
        "rotate": 0,
        "opacity": 1,
        "required": false,
        "readOnly": false
      },
      "p3-img-bottom": {
        "type": "image",
        "content": "data:image/png;base64,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",
        "position": {
          "x": 0,
          "y": 148.5
        },
        "width": 210,
        "height": 148.5,
        "rotate": 0,
        "opacity": 1,
        "required": false,
        "readOnly": false
      },
      "p3_headerLogo": {
        "type": "image",
        "position": {
          "x": 10,
          "y": 10
        },
        "width": 29,
        "height": 9,
        "content": "data:image/png;base64,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",
        "readOnly": true,
        "required": false
      },
      "p3-info-1": {
        "type": "text",
        "position": {
          "x": 85,
          "y": 10
        },
        "content": "Tel: (913) 999 9999\nforms@vindegarde.ca\nwww.vindegarde.ca",
        "width": 30,
        "height": 9,
        "fontSize": 8,
        "fontColor": "#C5BEB9",
        "alignment": "left",
        "fontName": "Apercu-Light",
        "readOnly": false
      },
      "p3-info-2": {
        "type": "text",
        "content": "Cecconi Simone\nFebruary 10, 2020",
        "position": {
          "x": 135,
          "y": 10
        },
        "width": 30,
        "height": 10,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#C5BEB9",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": false,
        "fontName": "Apercu-Light"
      },
      "p3-info-3": {
        "type": "text",
        "content": "Proposal v.01\nPage 3 / 7",
        "position": {
          "x": 166.85,
          "y": 9.95
        },
        "width": 33,
        "height": 10,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#C5BEB9",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": false,
        "fontName": "Apercu-Light"
      },
      "p3_footerLogo": {
        "type": "image",
        "position": {
          "x": 10,
          "y": 279
        },
        "width": 8,
        "height": 8,
        "content": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFQAAABUCAYAAAAcaxDBAAAACXBIWXMAACxKAAAsSgF3enRNAAAFCUlEQVR4nO2aT2gbRxTGX0puVXSNZMWn7MZuT3GaP7c6thsWQdubhO4SOtv4aoOPCaQ0IASiJFAKgdJijE/BwTjrnKwqsXOxVCL1ot2E9Ljb9Dw9pJItaVfamXkTjZX3gwHJMG/efuvVvPftnAOABwBwFQgUzsMHMefHncik8Nm4E5g0SFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkzqsMni8UAQDg0cOfVC4TmUw2B/F4HPbtZ9BqNZWtYwMAwxpr6xvsuN5g/RzXG2xtfQNtnagjXyiyp7t7A/m0HZfdvXdfxZo4ghqGGZh4PwfVGjMM86OI+fMvj0fmc1xvMMtK6yfoQbU2MvnTF6GDmB3ajot5k+UFvXvvfuTkO5TKFWVi5gtF7nw2t7b1EbTtuNwX4Hm+MkGj/PQEgfHoS5dNmWwOpi+luOfF4xe6VQA2d5YWhOYtLC5Jry0taCrFL2aHZHJKdvkBZG7S57GY9PrSgiYSSeG5FxMJ2eW1Q1rQZvO18NxXR4eyyw/gOg56TB6kBd23n41lbhg7O0/Acd8IzcW6wTZI7mybW9vcO+rT3T1lu3ypXOHOp+24+pRNlpVmnudHTt7zfOzupGcYhhnY/g5jeWVVH0EBgGWyuUiiep6Pmbx0PowxbI8BzxzJZHNDW9CDao1lsjnlYp7+Tx1W5LcdF/3mnvtf0HlAJJPNwdfzt3v+9nzfht9/+xVzmchYVhoWFpd66sy/Wk148OMP6GspEfRThhx7ZJQ59h13HADA933hx90wTJi/fdKbi7r/lpWGS9PT0vlEwQbEH+VSuRLoPrUdl8uyyxeKoRvc5tZ25LJreWU1sITyPJ+VyhUVZjeeYx+l9juuN0ZeRBRzOEr5FaXhaDsuduWBIyhPIT1MVJ4ux/P8UDF4ujfkRkNeUJFWL+jxt6w0d5yglnF5ZZU7zkG1po+gPG1nhyDHXsQTYGywbeR5v3UaLRz7fKEI8fgF7nlBjv2N618J5XB17lrP91s3rwvF0cKxl3HdTfNKz3eRVykAALMzJ3HOvGMfk0gC4wJ0QyvH3vf/EYrz5u3b7mcVpjUPWjn21doLoThHh0fdz61WU9ixf75vC83rxwbJnU1kdw46WCByQMHz/IGadm19gzsO4mkWeUENw+R27MMKe95DCmHdEq9jj9gtfXzHfljyPK8vhjntWHHGJijAh05n2OPPY2qUypXQG9R2XJYvFCM9OcN8ARVvEJQYzJaVhhs3b3UPMvz97h3U/qjCzs4T7ljLK6tw2TC730Wcf8Mw4dvvvu/G+ff9e3j58oUSC48ce2TIsUdG6Rl7DDLZHKRSKbhsmPDq6BBcxxH66cgXipBMTkEsFoNm87XSc/Y2IP4oY4219Y3Qc6c8m0nYGwTeTZJj6Cdo1EZhVNkUxcYbVcadeUF5zsYzxkLLJx5PFFlUfQQVaT2DHHuR1lMrxx5riDr2/Y8+b9vZAeO/VKuy6ZtFsbPxc9fmup8Nw4Qvv5gVitN/fEgErQQVeZUCAJCaOnlrcPpQxDjQStBJQCtBybFHZndPTIx+x77e+FMojjaOPdagsknBoMJewcBqPaPUoxPfenYGpjkS5vyrMEe0N5gz2RzMzMzCxUQCxb7rxFFl32kv6FlDq7JpEiBBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkfkPP+26e/ySvs0AAAAASUVORK5CYII=",
        "readOnly": true,
        "required": false
      },
      "p3_footer_tagline": {
        "type": "text",
        "position": {
          "x": 135.06,
          "y": 280.92
        },
        "content": "wine, science and design",
        "width": 68,
        "height": 6,
        "fontSize": 16,
        "fontColor": "#C5BEB9",
        "alignment": "left",
        "fontName": "Apercu-Light",
        "readOnly": true,
        "required": false
      }
    },
    {
      "p4_headerLogo": {
        "type": "image",
        "position": {
          "x": 10,
          "y": 10
        },
        "width": 29,
        "height": 9,
        "content": "data:image/png;base64,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",
        "readOnly": true,
        "required": false
      },
      "p4_col_1": {
        "type": "text",
        "position": {
          "x": 85,
          "y": 10
        },
        "content": "Tel: (913) 999 9999\nforms@vindegarde.ca\nwww.vindegarde.ca",
        "width": 30,
        "height": 9,
        "fontSize": 8,
        "fontColor": "#191818",
        "alignment": "left",
        "fontName": "Apercu-Light",
        "readOnly": false
      },
      "p4_col_2": {
        "type": "text",
        "content": "Cecconi Simone\nFebruary 10, 2020",
        "position": {
          "x": 135,
          "y": 10
        },
        "width": 30,
        "height": 10,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": false,
        "fontName": "Apercu-Light"
      },
      "p4_col_3": {
        "type": "text",
        "content": "Proposal v.01\nPage 4 / 7",
        "position": {
          "x": 166.85,
          "y": 9.95
        },
        "width": 33,
        "height": 10,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": false,
        "fontName": "Apercu-Light"
      },
      "p4_footerLogo": {
        "type": "image",
        "position": {
          "x": 10,
          "y": 279
        },
        "width": 8,
        "height": 8,
        "content": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFQAAABUCAYAAAAcaxDBAAAACXBIWXMAACxKAAAsSgF3enRNAAAFCUlEQVR4nO2aT2gbRxTGX0puVXSNZMWn7MZuT3GaP7c6thsWQdubhO4SOtv4aoOPCaQ0IASiJFAKgdJijE/BwTjrnKwqsXOxVCL1ot2E9Ljb9Dw9pJItaVfamXkTjZX3gwHJMG/efuvVvPftnAOABwBwFQgUzsMHMefHncik8Nm4E5g0SFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkzqsMni8UAQDg0cOfVC4TmUw2B/F4HPbtZ9BqNZWtYwMAwxpr6xvsuN5g/RzXG2xtfQNtnagjXyiyp7t7A/m0HZfdvXdfxZo4ghqGGZh4PwfVGjMM86OI+fMvj0fmc1xvMMtK6yfoQbU2MvnTF6GDmB3ajot5k+UFvXvvfuTkO5TKFWVi5gtF7nw2t7b1EbTtuNwX4Hm+MkGj/PQEgfHoS5dNmWwOpi+luOfF4xe6VQA2d5YWhOYtLC5Jry0taCrFL2aHZHJKdvkBZG7S57GY9PrSgiYSSeG5FxMJ2eW1Q1rQZvO18NxXR4eyyw/gOg56TB6kBd23n41lbhg7O0/Acd8IzcW6wTZI7mybW9vcO+rT3T1lu3ypXOHOp+24+pRNlpVmnudHTt7zfOzupGcYhhnY/g5jeWVVH0EBgGWyuUiiep6Pmbx0PowxbI8BzxzJZHNDW9CDao1lsjnlYp7+Tx1W5LcdF/3mnvtf0HlAJJPNwdfzt3v+9nzfht9/+xVzmchYVhoWFpd66sy/Wk148OMP6GspEfRThhx7ZJQ59h13HADA933hx90wTJi/fdKbi7r/lpWGS9PT0vlEwQbEH+VSuRLoPrUdl8uyyxeKoRvc5tZ25LJreWU1sITyPJ+VyhUVZjeeYx+l9juuN0ZeRBRzOEr5FaXhaDsuduWBIyhPIT1MVJ4ux/P8UDF4ujfkRkNeUJFWL+jxt6w0d5yglnF5ZZU7zkG1po+gPG1nhyDHXsQTYGywbeR5v3UaLRz7fKEI8fgF7nlBjv2N618J5XB17lrP91s3rwvF0cKxl3HdTfNKz3eRVykAALMzJ3HOvGMfk0gC4wJ0QyvH3vf/EYrz5u3b7mcVpjUPWjn21doLoThHh0fdz61WU9ixf75vC83rxwbJnU1kdw46WCByQMHz/IGadm19gzsO4mkWeUENw+R27MMKe95DCmHdEq9jj9gtfXzHfljyPK8vhjntWHHGJijAh05n2OPPY2qUypXQG9R2XJYvFCM9OcN8ARVvEJQYzJaVhhs3b3UPMvz97h3U/qjCzs4T7ljLK6tw2TC730Wcf8Mw4dvvvu/G+ff9e3j58oUSC48ce2TIsUdG6Rl7DDLZHKRSKbhsmPDq6BBcxxH66cgXipBMTkEsFoNm87XSc/Y2IP4oY4219Y3Qc6c8m0nYGwTeTZJj6Cdo1EZhVNkUxcYbVcadeUF5zsYzxkLLJx5PFFlUfQQVaT2DHHuR1lMrxx5riDr2/Y8+b9vZAeO/VKuy6ZtFsbPxc9fmup8Nw4Qvv5gVitN/fEgErQQVeZUCAJCaOnlrcPpQxDjQStBJQCtBybFHZndPTIx+x77e+FMojjaOPdagsknBoMJewcBqPaPUoxPfenYGpjkS5vyrMEe0N5gz2RzMzMzCxUQCxb7rxFFl32kv6FlDq7JpEiBBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkfkPP+26e/ySvs0AAAAASUVORK5CYII=",
        "readOnly": true,
        "required": false
      },
      "p4_footer_tagline": {
        "type": "text",
        "position": {
          "x": 135.06,
          "y": 280.92
        },
        "content": "wine, science and design",
        "width": 68,
        "height": 6,
        "fontSize": 16,
        "fontColor": "#C5BEB9",
        "alignment": "left",
        "fontName": "Apercu-Light",
        "readOnly": true,
        "required": false
      },
      "p4-h1": {
        "type": "text",
        "content": "Design Proposal 1.0",
        "position": {
          "x": 10,
          "y": 43
        },
        "width": 78,
        "height": 10,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 24,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": false,
        "fontName": "Apercu-Bold"
      },
      "p4-intro": {
        "type": "text",
        "content": "This letter is to outline the proposed scope of work provided by Vin de Garde Cellar Systems for the {insert project name}",
        "position": {
          "x": 42.96,
          "y": 59
        },
        "width": 81.82,
        "height": 6.81,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1.2,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": false,
        "fontName": "Apercu-Light"
      },
      "p4-body": {
        "type": "text",
        "content": "Consultation\nDetermine project objectives and design intent\nProject details\u0003Review project details\u0003Confirm site dimensions\nConfirm project requirements and access\nConfirm scope of work and budget\nDesign\n3D conceptual drawings for custom wine cellar\nReview mark up of conceptual drawings\nRevisions\n1 set of revisions to conceptual design\nSign off preliminary design drawings\nSpecifications for rough-in\n2D CAD drawings and rough-in sketches for general contractor and construction trades\nSpecifications for rough-in will be supplied upon design sign off\n\n\nDesign (wine cellar & tasting room) = 100% of CAD $10,000.00 = CAD $10,000.00\nNot included in price, not included in scope\nAny additional work will be billed at CAD $300/hour\nProprietary dimensions\nShop drawings\n\n\n3D concepts will be delivered as pdf files 21 days from signed \nagreement and down payment\nRevised concepts will be delivered as pdf files 14 days from \nreceiving mark-ups\nRough-ins/Build out drawings will be delivered 14 days from \nreceiving sign off of concept\n\n\n50% down payment = CAD $10,000.00\u0003\nA written change order agreement will be completed \nprior to start work or order of any product not included \nin this proposal\n\n\nYour signature below indicates you have read, understood and agree to the scope of work, pricing,  delivery timeline and payment terms.",
        "position": {
          "x": 48.09,
          "y": 75
        },
        "width": 92,
        "height": 155,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1.3,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": false,
        "fontName": "Apercu-Light"
      },
      "p4-bullet": {
        "type": "text",
        "content": "1.1\n1.2\n1.3\n1.4\n1.5\n1.6\n1.7\n1.8\n1.9\n1.10\n1.11\n1.12\n1.13\n\n1.16\n\n\n1.1\n\n1.3\n1.4\n1.5\n1.6\n\n\n1.1\n1.2\n1.3\n\n1.5\n\n\n\n1.1\n1.2",
        "position": {
          "x": 43,
          "y": 75
        },
        "width": 5,
        "height": 155,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1.3,
        "characterSpacing": 0,
        "fontColor": "#000000",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": false,
        "fontName": "Apercu-Light"
      },
      "p4-title-bullet": {
        "type": "text",
        "content": "Scope of Work\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nProject Price\n\n\n\n\n\n\n\nDelivery Timeline\n\n\n\n\n\n\n\nPayment Timeline\n\n\n\n\n\nAgreement\n& Approval",
        "position": {
          "x": 10,
          "y": 75
        },
        "width": 23,
        "height": 155,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1.3,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": false,
        "fontName": "Apercu-Bold"
      },
      "p4-line1": {
        "type": "line",
        "position": {
          "x": 10,
          "y": 70
        },
        "width": 130,
        "height": 0.1,
        "rotate": 0,
        "opacity": 1,
        "readOnly": true,
        "color": "#EAE9E8",
        "required": false
      },
      "p4-line-2": {
        "type": "line",
        "position": {
          "x": 10,
          "y": 134
        },
        "width": 130,
        "height": 0.1,
        "rotate": 0,
        "opacity": 1,
        "readOnly": true,
        "color": "#EAE9E8",
        "required": false
      },
      "p4-line3": {
        "type": "line",
        "position": {
          "x": 10,
          "y": 163
        },
        "width": 130,
        "height": 0.1,
        "rotate": 0,
        "opacity": 1,
        "readOnly": true,
        "color": "#EAE9E8",
        "required": false
      },
      "p4-line4": {
        "type": "line",
        "position": {
          "x": 10,
          "y": 192
        },
        "width": 130,
        "height": 0.1,
        "rotate": 0,
        "opacity": 1,
        "readOnly": true,
        "color": "#EAE9E8",
        "required": false
      },
      "p4-line5": {
        "type": "line",
        "position": {
          "x": 10,
          "y": 215
        },
        "width": 130,
        "height": 0.1,
        "rotate": 0,
        "opacity": 1,
        "readOnly": true,
        "color": "#EAE9E8",
        "required": false
      },
      "p4-signature": {
        "type": "text",
        "content": "Signature",
        "position": {
          "x": 43,
          "y": 249
        },
        "width": 45,
        "height": 4,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": false,
        "fontName": "Apercu-Light"
      },
      "p4-printname": {
        "type": "text",
        "content": "Print name",
        "position": {
          "x": 43,
          "y": 264
        },
        "width": 45,
        "height": 4,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": false,
        "fontName": "Apercu-Light"
      },
      "p4-date": {
        "type": "text",
        "content": "Date",
        "position": {
          "x": 136,
          "y": 264
        },
        "width": 37,
        "height": 4,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": false,
        "fontName": "Apercu-Light"
      },
      "p4-sigline": {
        "type": "line",
        "position": {
          "x": 43,
          "y": 248
        },
        "width": 80,
        "height": 0.1,
        "rotate": 0,
        "opacity": 1,
        "readOnly": true,
        "color": "#C5BEB9",
        "required": false
      },
      "p4-namedateline": {
        "type": "line",
        "position": {
          "x": 43,
          "y": 263
        },
        "width": 130,
        "height": 0.1,
        "rotate": 0,
        "opacity": 1,
        "readOnly": true,
        "color": "#C5BEB9",
        "required": false
      }
    },
    {
      "p5-highlight-2": {
        "type": "rectangle",
        "position": {
          "x": 135,
          "y": 215
        },
        "width": 45,
        "height": 5,
        "rotate": 0,
        "opacity": 1,
        "borderWidth": 0.1,
        "borderColor": "#191818",
        "color": "#EAE9E8",
        "readOnly": true,
        "required": false
      },
      "p5-highlight-1": {
        "type": "rectangle",
        "position": {
          "x": 135,
          "y": 220
        },
        "width": 45,
        "height": 5,
        "rotate": 0,
        "opacity": 1,
        "borderWidth": 0.1,
        "borderColor": "#191818",
        "color": "#EAE9E8",
        "readOnly": true,
        "required": false
      },
      "p5_headerLogo": {
        "type": "image",
        "position": {
          "x": 10,
          "y": 10
        },
        "width": 29,
        "height": 9,
        "content": "data:image/png;base64,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",
        "readOnly": true,
        "required": false
      },
      "p5-highlight": {
        "type": "rectangle",
        "position": {
          "x": 10,
          "y": 90
        },
        "width": 170,
        "height": 5,
        "rotate": 0,
        "opacity": 1,
        "borderWidth": 0,
        "borderColor": "#ffffff",
        "color": "#EAE9E8",
        "readOnly": true,
        "required": false
      },
      "p5_col_1": {
        "type": "text",
        "position": {
          "x": 85,
          "y": 10
        },
        "content": "Tel: (913) 999 9999\nforms@vindegarde.ca\nwww.vindegarde.ca",
        "width": 30,
        "height": 9,
        "fontSize": 8,
        "fontColor": "#191818",
        "alignment": "left",
        "fontName": "Apercu-Light",
        "readOnly": false
      },
      "p5_col_2": {
        "type": "text",
        "content": "Cecconi Simone\nFebruary 10, 2020",
        "position": {
          "x": 135,
          "y": 10
        },
        "width": 30,
        "height": 10,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": false,
        "fontName": "Apercu-Light"
      },
      "p5_col_3": {
        "type": "text",
        "content": "Proposal v.01\nPage 5 / 7",
        "position": {
          "x": 166.85,
          "y": 9.95
        },
        "width": 33,
        "height": 10,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": false,
        "fontName": "Apercu-Light"
      },
      "p5_footerLogo": {
        "type": "image",
        "position": {
          "x": 10,
          "y": 279
        },
        "width": 8,
        "height": 8,
        "content": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFQAAABUCAYAAAAcaxDBAAAACXBIWXMAACxKAAAsSgF3enRNAAAFCUlEQVR4nO2aT2gbRxTGX0puVXSNZMWn7MZuT3GaP7c6thsWQdubhO4SOtv4aoOPCaQ0IASiJFAKgdJijE/BwTjrnKwqsXOxVCL1ot2E9Ljb9Dw9pJItaVfamXkTjZX3gwHJMG/efuvVvPftnAOABwBwFQgUzsMHMefHncik8Nm4E5g0SFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkzqsMni8UAQDg0cOfVC4TmUw2B/F4HPbtZ9BqNZWtYwMAwxpr6xvsuN5g/RzXG2xtfQNtnagjXyiyp7t7A/m0HZfdvXdfxZo4ghqGGZh4PwfVGjMM86OI+fMvj0fmc1xvMMtK6yfoQbU2MvnTF6GDmB3ajot5k+UFvXvvfuTkO5TKFWVi5gtF7nw2t7b1EbTtuNwX4Hm+MkGj/PQEgfHoS5dNmWwOpi+luOfF4xe6VQA2d5YWhOYtLC5Jry0taCrFL2aHZHJKdvkBZG7S57GY9PrSgiYSSeG5FxMJ2eW1Q1rQZvO18NxXR4eyyw/gOg56TB6kBd23n41lbhg7O0/Acd8IzcW6wTZI7mybW9vcO+rT3T1lu3ypXOHOp+24+pRNlpVmnudHTt7zfOzupGcYhhnY/g5jeWVVH0EBgGWyuUiiep6Pmbx0PowxbI8BzxzJZHNDW9CDao1lsjnlYp7+Tx1W5LcdF/3mnvtf0HlAJJPNwdfzt3v+9nzfht9/+xVzmchYVhoWFpd66sy/Wk148OMP6GspEfRThhx7ZJQ59h13HADA933hx90wTJi/fdKbi7r/lpWGS9PT0vlEwQbEH+VSuRLoPrUdl8uyyxeKoRvc5tZ25LJreWU1sITyPJ+VyhUVZjeeYx+l9juuN0ZeRBRzOEr5FaXhaDsuduWBIyhPIT1MVJ4ux/P8UDF4ujfkRkNeUJFWL+jxt6w0d5yglnF5ZZU7zkG1po+gPG1nhyDHXsQTYGywbeR5v3UaLRz7fKEI8fgF7nlBjv2N618J5XB17lrP91s3rwvF0cKxl3HdTfNKz3eRVykAALMzJ3HOvGMfk0gC4wJ0QyvH3vf/EYrz5u3b7mcVpjUPWjn21doLoThHh0fdz61WU9ixf75vC83rxwbJnU1kdw46WCByQMHz/IGadm19gzsO4mkWeUENw+R27MMKe95DCmHdEq9jj9gtfXzHfljyPK8vhjntWHHGJijAh05n2OPPY2qUypXQG9R2XJYvFCM9OcN8ARVvEJQYzJaVhhs3b3UPMvz97h3U/qjCzs4T7ljLK6tw2TC730Wcf8Mw4dvvvu/G+ff9e3j58oUSC48ce2TIsUdG6Rl7DDLZHKRSKbhsmPDq6BBcxxH66cgXipBMTkEsFoNm87XSc/Y2IP4oY4219Y3Qc6c8m0nYGwTeTZJj6Cdo1EZhVNkUxcYbVcadeUF5zsYzxkLLJx5PFFlUfQQVaT2DHHuR1lMrxx5riDr2/Y8+b9vZAeO/VKuy6ZtFsbPxc9fmup8Nw4Qvv5gVitN/fEgErQQVeZUCAJCaOnlrcPpQxDjQStBJQCtBybFHZndPTIx+x77e+FMojjaOPdagsknBoMJewcBqPaPUoxPfenYGpjkS5vyrMEe0N5gz2RzMzMzCxUQCxb7rxFFl32kv6FlDq7JpEiBBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkfkPP+26e/ySvs0AAAAASUVORK5CYII=",
        "readOnly": true,
        "required": false
      },
      "p5_footer_tagline": {
        "type": "text",
        "position": {
          "x": 135.06,
          "y": 280.92
        },
        "content": "wine, science and design",
        "width": 68,
        "height": 6,
        "fontSize": 16,
        "fontColor": "#C5BEB9",
        "alignment": "left",
        "fontName": "Apercu-Light",
        "readOnly": true,
        "required": false
      },
      "p5-title-build": {
        "type": "text",
        "content": "Build Package",
        "position": {
          "x": 10,
          "y": 43
        },
        "width": 78,
        "height": 10,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 24,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": true,
        "fontName": "Apercu-Bold"
      },
      "p5-billname": {
        "type": "text",
        "content": "Cecconi Simone",
        "position": {
          "x": 135,
          "y": 43
        },
        "width": 45,
        "height": 4,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1.2,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": false,
        "fontName": "Apercu-Regular"
      },
      "p5-line1-1": {
        "type": "line",
        "position": {
          "x": 10,
          "y": 90
        },
        "width": 170,
        "height": 0.1,
        "rotate": 0,
        "opacity": 1,
        "readOnly": true,
        "color": "#191818",
        "required": false
      },
      "p5-line_field45": {
        "type": "line",
        "position": {
          "x": 10,
          "y": 85
        },
        "width": 170,
        "height": 0.1,
        "rotate": 0,
        "opacity": 1,
        "readOnly": true,
        "color": "#191818",
        "required": false
      },
      "p5-line-0": {
        "type": "line",
        "position": {
          "x": 10,
          "y": 188
        },
        "width": 170,
        "height": 0.1,
        "rotate": 0,
        "opacity": 1,
        "readOnly": true,
        "color": "#191818",
        "required": false
      },
      "p5-bp_line": {
        "type": "line",
        "position": {
          "x": 10,
          "y": 215
        },
        "width": 170,
        "height": 0.2,
        "rotate": 0,
        "opacity": 1,
        "readOnly": true,
        "color": "#191818",
        "required": false
      },
      "p5-timelineShip": {
        "type": "text",
        "content": "Timeline to ship",
        "position": {
          "x": 15,
          "y": 231
        },
        "width": 105,
        "height": 4,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": true,
        "fontName": "Apercu-Regular"
      },
      "p5-terms": {
        "type": "text",
        "content": "Payment terms",
        "position": {
          "x": 15,
          "y": 253
        },
        "width": 105,
        "height": 4,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": true,
        "fontName": "Apercu-Regular"
      },
      "p5-payment": {
        "type": "text",
        "content": "All payments must be made by wire transfer, details to be provided, 50% upon sign off of conceptual design & materials, 40% due upon crating, 10% due upon installation. Any balance due after 30 days of invoice will accure interest of 3% per month, until paid.",
        "position": {
          "x": 15,
          "y": 257
        },
        "width": 105,
        "height": 14,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1.2,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": false,
        "fontName": "Apercu-Light"
      },
      "p5-billaddress": {
        "type": "text",
        "content": "1335 Dundas St. West\nToronto, Ontario, Canada M6J 1Y3\n416 588 5900",
        "position": {
          "x": 135,
          "y": 47
        },
        "width": 45,
        "height": 10,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1.2,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": false,
        "fontName": "Apercu-Light"
      },
      "p5-billtitle": {
        "type": "text",
        "content": "Bill to:",
        "position": {
          "x": 135,
          "y": 33
        },
        "width": 45,
        "height": 10,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 16,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": true,
        "fontName": "Apercu-Bold"
      },
      "p5-packagelineitem": {
        "type": "text",
        "content": "Bespoke wine cellar package - Wine storage systems",
        "position": {
          "x": 15,
          "y": 90
        },
        "width": 105,
        "height": 5,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "middle",
        "fontSize": 8,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": false,
        "fontName": "Apercu-Regular"
      },
      "p5-designtitle": {
        "type": "text",
        "content": "Design deliverables",
        "position": {
          "x": 15,
          "y": 98
        },
        "width": 45,
        "height": 3,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": true,
        "fontName": "Apercu-Regular"
      },
      "p5-designbody": {
        "type": "text",
        "content": "as in Design Proposal 1.0",
        "position": {
          "x": 20,
          "y": 102
        },
        "width": 45,
        "height": 8,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1.2,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": false,
        "fontName": "Apercu-Light"
      },
      "p5-productlinetitle": {
        "type": "text",
        "content": "Wine Storage Systems",
        "position": {
          "x": 15,
          "y": 111.84
        },
        "width": 45,
        "height": 3,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": true,
        "fontName": "Apercu-Regular"
      },
      "p5-productbody": {
        "type": "text",
        "content": "Vertical series™ wine storage systems, flat black and brushed finishes\nFloor to ceiling mount, with wall/column support\nAssembly and installation hardware and fasteners",
        "position": {
          "x": 20,
          "y": 116
        },
        "width": 105,
        "height": 25,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1.2,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": false,
        "fontName": "Apercu-Light"
      },
      "p5-Delivery": {
        "type": "text",
        "content": "Delivery and installation",
        "position": {
          "x": 15,
          "y": 141
        },
        "width": 45,
        "height": 3,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": true,
        "fontName": "Apercu-Regular"
      },
      "p5-Not_included": {
        "type": "text",
        "content": "Package does not include:",
        "position": {
          "x": 15,
          "y": 195
        },
        "width": 45,
        "height": 3,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": true,
        "fontName": "Apercu-Regular"
      },
      "p5-notincludedbody": {
        "type": "text",
        "content": "Work normally performed by others. Deep cleaning. Local taxes and Duties. Connection to services. Proprietary designs",
        "position": {
          "x": 15,
          "y": 200
        },
        "width": 105,
        "height": 13.7,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1.2,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": false,
        "fontName": "Apercu-Light"
      },
      "p5-packagelineprice": {
        "type": "text",
        "content": "$25,000.00",
        "position": {
          "x": 138,
          "y": 90
        },
        "width": 45,
        "height": 5,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "middle",
        "fontSize": 8,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#000000",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": false,
        "fontName": "Apercu-Regular"
      },
      "p5-pricetotal": {
        "type": "text",
        "content": "$25,00.00",
        "position": {
          "x": 138,
          "y": 215
        },
        "width": 36,
        "height": 5,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "middle",
        "fontSize": 8,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": false,
        "fontName": "Apercu-Light"
      },
      "p5-50price": {
        "type": "text",
        "content": "$12,500.00",
        "position": {
          "x": 138,
          "y": 220
        },
        "width": 36,
        "height": 5,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "middle",
        "fontSize": 8,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": false,
        "fontName": "Apercu-Light"
      },
      "p5-totaldue": {
        "type": "text",
        "content": "Total:",
        "position": {
          "x": 90,
          "y": 215
        },
        "width": 41,
        "height": 5,
        "rotate": 0,
        "alignment": "right",
        "verticalAlignment": "middle",
        "fontSize": 8,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": true,
        "fontName": "Apercu-Regular"
      },
      "p5-crating": {
        "type": "text",
        "content": "Crating, Brokerage and delivery to site\nLTL shipping, curbside delivery\nProducts unpacked and moved to staging area by VDG\u0003Secure and covered storage space required until VDG arrive\nAll components assembled and installed by VDG",
        "position": {
          "x": 20,
          "y": 145
        },
        "width": 105,
        "height": 21.63,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1.2,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": false,
        "fontName": "Apercu-Light"
      },
      "p5-description": {
        "type": "text",
        "content": "Description",
        "position": {
          "x": 15,
          "y": 86
        },
        "width": 45,
        "height": 4,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#000000",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": true,
        "fontName": "Apercu-Regular"
      },
      "p5-totaltitle": {
        "type": "text",
        "content": "Total",
        "position": {
          "x": 138,
          "y": 86
        },
        "width": 45,
        "height": 4,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#000000",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": true,
        "fontName": "Apercu-Regular"
      },
      "p5-timeline-body": {
        "type": "text",
        "content": "Shop drawings will be delivered 14 days from down payment & as built site dimensions. Products will ship 16 weeks or less from signed shop drawings. Will ship only upon confirmation of balance payment. Installation will start only when product and tools have been delivered in good order.",
        "position": {
          "x": 15,
          "y": 235
        },
        "width": 105,
        "height": 14,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1.2,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": false,
        "fontName": "Apercu-Light"
      },
      "p5-50title": {
        "type": "text",
        "content": "50% upon agreement:",
        "position": {
          "x": 90,
          "y": 220
        },
        "width": 41,
        "height": 5,
        "rotate": 0,
        "alignment": "right",
        "verticalAlignment": "middle",
        "fontSize": 8,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": false,
        "fontName": "Apercu-Regular"
      },
      "p5-total": {
        "type": "rectangle",
        "position": {
          "x": 90,
          "y": 215
        },
        "width": 45,
        "height": 5,
        "rotate": 0,
        "opacity": 1,
        "borderWidth": 0.1,
        "borderColor": "#191818",
        "color": "",
        "readOnly": true,
        "required": false
      },
      "p5-50due": {
        "type": "rectangle",
        "position": {
          "x": 90,
          "y": 220
        },
        "width": 45,
        "height": 5,
        "rotate": 0,
        "opacity": 1,
        "borderWidth": 0.1,
        "borderColor": "#191818",
        "color": "",
        "readOnly": true,
        "required": false
      },
      "p5-vertline": {
        "type": "line",
        "position": {
          "x": 65,
          "y": 155
        },
        "width": 140,
        "height": 0.1,
        "rotate": 90,
        "opacity": 1,
        "readOnly": true,
        "color": "#191818",
        "required": false
      }
    },
    {
      "p6_headerLogo": {
        "type": "image",
        "position": {
          "x": 10,
          "y": 10
        },
        "width": 29,
        "height": 9,
        "content": "data:image/png;base64,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",
        "readOnly": true,
        "required": false
      },
      "p6_col_1": {
        "type": "text",
        "position": {
          "x": 85,
          "y": 10
        },
        "content": "Tel: (913) 999 9999\nforms@vindegarde.ca\nwww.vindegarde.ca",
        "width": 30,
        "height": 9,
        "fontSize": 8,
        "fontColor": "#191818",
        "alignment": "left",
        "fontName": "Apercu-Light",
        "readOnly": false
      },
      "p6_col_2": {
        "type": "text",
        "content": "Cecconi Simone\nFebruary 10, 2020",
        "position": {
          "x": 135,
          "y": 10
        },
        "width": 30,
        "height": 10,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": false,
        "fontName": "Apercu-Light"
      },
      "p6_col_3": {
        "type": "text",
        "content": "Proposal v.01\nPage 6 / 7",
        "position": {
          "x": 166.85,
          "y": 9.95
        },
        "width": 33,
        "height": 10,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": false,
        "fontName": "Apercu-Light"
      },
      "p6_footerLogo": {
        "type": "image",
        "position": {
          "x": 10,
          "y": 279
        },
        "width": 8,
        "height": 8,
        "content": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFQAAABUCAYAAAAcaxDBAAAACXBIWXMAACxKAAAsSgF3enRNAAAFCUlEQVR4nO2aT2gbRxTGX0puVXSNZMWn7MZuT3GaP7c6thsWQdubhO4SOtv4aoOPCaQ0IASiJFAKgdJijE/BwTjrnKwqsXOxVCL1ot2E9Ljb9Dw9pJItaVfamXkTjZX3gwHJMG/efuvVvPftnAOABwBwFQgUzsMHMefHncik8Nm4E5g0SFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkzqsMni8UAQDg0cOfVC4TmUw2B/F4HPbtZ9BqNZWtYwMAwxpr6xvsuN5g/RzXG2xtfQNtnagjXyiyp7t7A/m0HZfdvXdfxZo4ghqGGZh4PwfVGjMM86OI+fMvj0fmc1xvMMtK6yfoQbU2MvnTF6GDmB3ajot5k+UFvXvvfuTkO5TKFWVi5gtF7nw2t7b1EbTtuNwX4Hm+MkGj/PQEgfHoS5dNmWwOpi+luOfF4xe6VQA2d5YWhOYtLC5Jry0taCrFL2aHZHJKdvkBZG7S57GY9PrSgiYSSeG5FxMJ2eW1Q1rQZvO18NxXR4eyyw/gOg56TB6kBd23n41lbhg7O0/Acd8IzcW6wTZI7mybW9vcO+rT3T1lu3ypXOHOp+24+pRNlpVmnudHTt7zfOzupGcYhhnY/g5jeWVVH0EBgGWyuUiiep6Pmbx0PowxbI8BzxzJZHNDW9CDao1lsjnlYp7+Tx1W5LcdF/3mnvtf0HlAJJPNwdfzt3v+9nzfht9/+xVzmchYVhoWFpd66sy/Wk148OMP6GspEfRThhx7ZJQ59h13HADA933hx90wTJi/fdKbi7r/lpWGS9PT0vlEwQbEH+VSuRLoPrUdl8uyyxeKoRvc5tZ25LJreWU1sITyPJ+VyhUVZjeeYx+l9juuN0ZeRBRzOEr5FaXhaDsuduWBIyhPIT1MVJ4ux/P8UDF4ujfkRkNeUJFWL+jxt6w0d5yglnF5ZZU7zkG1po+gPG1nhyDHXsQTYGywbeR5v3UaLRz7fKEI8fgF7nlBjv2N618J5XB17lrP91s3rwvF0cKxl3HdTfNKz3eRVykAALMzJ3HOvGMfk0gC4wJ0QyvH3vf/EYrz5u3b7mcVpjUPWjn21doLoThHh0fdz61WU9ixf75vC83rxwbJnU1kdw46WCByQMHz/IGadm19gzsO4mkWeUENw+R27MMKe95DCmHdEq9jj9gtfXzHfljyPK8vhjntWHHGJijAh05n2OPPY2qUypXQG9R2XJYvFCM9OcN8ARVvEJQYzJaVhhs3b3UPMvz97h3U/qjCzs4T7ljLK6tw2TC730Wcf8Mw4dvvvu/G+ff9e3j58oUSC48ce2TIsUdG6Rl7DDLZHKRSKbhsmPDq6BBcxxH66cgXipBMTkEsFoNm87XSc/Y2IP4oY4219Y3Qc6c8m0nYGwTeTZJj6Cdo1EZhVNkUxcYbVcadeUF5zsYzxkLLJx5PFFlUfQQVaT2DHHuR1lMrxx5riDr2/Y8+b9vZAeO/VKuy6ZtFsbPxc9fmup8Nw4Qvv5gVitN/fEgErQQVeZUCAJCaOnlrcPpQxDjQStBJQCtBybFHZndPTIx+x77e+FMojjaOPdagsknBoMJewcBqPaPUoxPfenYGpjkS5vyrMEe0N5gz2RzMzMzCxUQCxb7rxFFl32kv6FlDq7JpEiBBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkfkPP+26e/ySvs0AAAAASUVORK5CYII=",
        "readOnly": true,
        "required": false
      },
      "p6_footer_tagline": {
        "type": "text",
        "position": {
          "x": 135.06,
          "y": 280.92
        },
        "content": "wine, science and design",
        "width": 68,
        "height": 6,
        "fontSize": 16,
        "fontColor": "#C5BEB9",
        "alignment": "left",
        "fontName": "Apercu-Light",
        "readOnly": true,
        "required": false
      },
      "payment-title": {
        "type": "text",
        "content": "Payment Details",
        "position": {
          "x": 10,
          "y": 43
        },
        "width": 78,
        "height": 10,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 24,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#000000",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": true,
        "fontName": "Apercu-Bold"
      },
      "field40-1": {
        "type": "text",
        "content": "Please make payments by transfer to our \nChase USD account",
        "position": {
          "x": 42,
          "y": 75
        },
        "width": 81,
        "height": 7,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1.2,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": true,
        "fontName": "Apercu-Light"
      },
      "bank-name": {
        "type": "text",
        "content": "Bank name:",
        "position": {
          "x": 90,
          "y": 89
        },
        "width": 35,
        "height": 4,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1.3,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": true,
        "fontName": "Apercu-Regular"
      },
      "acc-holder-name": {
        "type": "text",
        "content": "Account holders name:",
        "position": {
          "x": 42,
          "y": 89
        },
        "width": 35,
        "height": 4,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1.3,
        "characterSpacing": 0,
        "fontColor": "#000000",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": true,
        "fontName": "Apercu-Regular"
      },
      "wire-title": {
        "type": "text",
        "content": "Wire Transfer",
        "position": {
          "x": 10,
          "y": 75
        },
        "width": 23,
        "height": 48.9,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 16,
        "lineHeight": 1.3,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": true,
        "fontName": "Apercu-Bold"
      },
      "swift": {
        "type": "text",
        "content": "Swift code:",
        "position": {
          "x": 136,
          "y": 89
        },
        "width": 35,
        "height": 4,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": true,
        "fontName": "Apercu-Regular"
      },
      "field137": {
        "type": "text",
        "content": "William B Carpenter",
        "position": {
          "x": 42,
          "y": 93
        },
        "width": 45,
        "height": 4,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": false,
        "fontName": "Apercu-Light"
      },
      "field138": {
        "type": "text",
        "content": "JPMorgan/Chase",
        "position": {
          "x": 90,
          "y": 93
        },
        "width": 45,
        "height": 4,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": false,
        "fontName": "Apercu-Light"
      },
      "field139": {
        "type": "text",
        "content": "CHASUS33",
        "position": {
          "x": 136,
          "y": 93
        },
        "width": 45,
        "height": 4,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": false,
        "fontName": "Apercu-Light"
      },
      "acc-holder-add": {
        "type": "text",
        "content": "Account Holders address:",
        "position": {
          "x": 42,
          "y": 100
        },
        "width": 45,
        "height": 4,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": true,
        "fontName": "Apercu-Regular"
      },
      "bank-add": {
        "type": "text",
        "content": "Bank address:",
        "position": {
          "x": 90,
          "y": 100
        },
        "width": 45,
        "height": 4,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": true,
        "fontName": "Apercu-Regular"
      },
      "routing": {
        "type": "text",
        "content": "Routing number:",
        "position": {
          "x": 136,
          "y": 100
        },
        "width": 45,
        "height": 4,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": true,
        "fontName": "Apercu-Regular"
      },
      "field143": {
        "type": "text",
        "content": "1055 Jay Crescent,\u0003\nSquamish, BC \u0003\nCanada, V8B 0P3",
        "position": {
          "x": 42,
          "y": 105
        },
        "width": 45,
        "height": 10,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": false,
        "fontName": "Apercu-Light"
      },
      "field144": {
        "type": "text",
        "content": "270 Park Avenue, \u0003\nNew York, New York, \nUSA, 10017",
        "position": {
          "x": 90,
          "y": 105
        },
        "width": 45,
        "height": 10,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": false,
        "fontName": "Apercu-Light"
      },
      "field145": {
        "type": "text",
        "content": "021000021",
        "position": {
          "x": 136,
          "y": 105
        },
        "width": 45,
        "height": 4,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": false,
        "fontName": "Apercu-Light"
      },
      "acc-no": {
        "type": "text",
        "content": "Account number:",
        "position": {
          "x": 136,
          "y": 112
        },
        "width": 45,
        "height": 4,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": true,
        "fontName": "Apercu-Regular"
      },
      "field147": {
        "type": "text",
        "content": "511692829",
        "position": {
          "x": 136,
          "y": 116
        },
        "width": 45,
        "height": 4,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": false,
        "fontName": "Apercu-Light"
      }
    },
    {
      "p4_headerLogo": {
        "type": "image",
        "position": {
          "x": 10,
          "y": 10
        },
        "width": 29,
        "height": 9,
        "content": "data:image/png;base64,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",
        "readOnly": true,
        "required": false
      },
      "p7_col_1": {
        "type": "text",
        "position": {
          "x": 85,
          "y": 10
        },
        "content": "Tel: (913) 999 9999\nforms@vindegarde.ca\nwww.vindegarde.ca",
        "width": 30,
        "height": 9,
        "fontSize": 8,
        "fontColor": "#191818",
        "alignment": "left",
        "fontName": "Apercu-Light",
        "readOnly": false
      },
      "p7_col_2": {
        "type": "text",
        "content": "Cecconi Simone\nFebruary 10, 2020",
        "position": {
          "x": 135,
          "y": 10
        },
        "width": 30,
        "height": 10,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": false,
        "fontName": "Apercu-Light"
      },
      "p7_col_3": {
        "type": "text",
        "content": "Proposal v.01\nPage 7 / 7",
        "position": {
          "x": 166.85,
          "y": 9.95
        },
        "width": 33,
        "height": 10,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": false,
        "fontName": "Apercu-Light"
      },
      "p7_footerLogo": {
        "type": "image",
        "position": {
          "x": 10,
          "y": 279
        },
        "width": 8,
        "height": 8,
        "content": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFQAAABUCAYAAAAcaxDBAAAACXBIWXMAACxKAAAsSgF3enRNAAAFCUlEQVR4nO2aT2gbRxTGX0puVXSNZMWn7MZuT3GaP7c6thsWQdubhO4SOtv4aoOPCaQ0IASiJFAKgdJijE/BwTjrnKwqsXOxVCL1ot2E9Ljb9Dw9pJItaVfamXkTjZX3gwHJMG/efuvVvPftnAOABwBwFQgUzsMHMefHncik8Nm4E5g0SFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkzqsMni8UAQDg0cOfVC4TmUw2B/F4HPbtZ9BqNZWtYwMAwxpr6xvsuN5g/RzXG2xtfQNtnagjXyiyp7t7A/m0HZfdvXdfxZo4ghqGGZh4PwfVGjMM86OI+fMvj0fmc1xvMMtK6yfoQbU2MvnTF6GDmB3ajot5k+UFvXvvfuTkO5TKFWVi5gtF7nw2t7b1EbTtuNwX4Hm+MkGj/PQEgfHoS5dNmWwOpi+luOfF4xe6VQA2d5YWhOYtLC5Jry0taCrFL2aHZHJKdvkBZG7S57GY9PrSgiYSSeG5FxMJ2eW1Q1rQZvO18NxXR4eyyw/gOg56TB6kBd23n41lbhg7O0/Acd8IzcW6wTZI7mybW9vcO+rT3T1lu3ypXOHOp+24+pRNlpVmnudHTt7zfOzupGcYhhnY/g5jeWVVH0EBgGWyuUiiep6Pmbx0PowxbI8BzxzJZHNDW9CDao1lsjnlYp7+Tx1W5LcdF/3mnvtf0HlAJJPNwdfzt3v+9nzfht9/+xVzmchYVhoWFpd66sy/Wk148OMP6GspEfRThhx7ZJQ59h13HADA933hx90wTJi/fdKbi7r/lpWGS9PT0vlEwQbEH+VSuRLoPrUdl8uyyxeKoRvc5tZ25LJreWU1sITyPJ+VyhUVZjeeYx+l9juuN0ZeRBRzOEr5FaXhaDsuduWBIyhPIT1MVJ4ux/P8UDF4ujfkRkNeUJFWL+jxt6w0d5yglnF5ZZU7zkG1po+gPG1nhyDHXsQTYGywbeR5v3UaLRz7fKEI8fgF7nlBjv2N618J5XB17lrP91s3rwvF0cKxl3HdTfNKz3eRVykAALMzJ3HOvGMfk0gC4wJ0QyvH3vf/EYrz5u3b7mcVpjUPWjn21doLoThHh0fdz61WU9ixf75vC83rxwbJnU1kdw46WCByQMHz/IGadm19gzsO4mkWeUENw+R27MMKe95DCmHdEq9jj9gtfXzHfljyPK8vhjntWHHGJijAh05n2OPPY2qUypXQG9R2XJYvFCM9OcN8ARVvEJQYzJaVhhs3b3UPMvz97h3U/qjCzs4T7ljLK6tw2TC730Wcf8Mw4dvvvu/G+ff9e3j58oUSC48ce2TIsUdG6Rl7DDLZHKRSKbhsmPDq6BBcxxH66cgXipBMTkEsFoNm87XSc/Y2IP4oY4219Y3Qc6c8m0nYGwTeTZJj6Cdo1EZhVNkUxcYbVcadeUF5zsYzxkLLJx5PFFlUfQQVaT2DHHuR1lMrxx5riDr2/Y8+b9vZAeO/VKuy6ZtFsbPxc9fmup8Nw4Qvv5gVitN/fEgErQQVeZUCAJCaOnlrcPpQxDjQStBJQCtBybFHZndPTIx+x77e+FMojjaOPdagsknBoMJewcBqPaPUoxPfenYGpjkS5vyrMEe0N5gz2RzMzMzCxUQCxb7rxFFl32kv6FlDq7JpEiBBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkSFBkfkPP+26e/ySvs0AAAAASUVORK5CYII=",
        "readOnly": true,
        "required": false
      },
      "footer_tagline-p7": {
        "type": "text",
        "position": {
          "x": 135,
          "y": 280.92
        },
        "content": "wine, science and design",
        "width": 68,
        "height": 6,
        "fontSize": 16,
        "fontColor": "#C5BEB9",
        "alignment": "left",
        "fontName": "Apercu-Light",
        "readOnly": true,
        "required": false
      },
      "warrent-title": {
        "type": "text",
        "content": "Limited Warranty",
        "position": {
          "x": 42,
          "y": 60
        },
        "width": 78,
        "height": 10,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 24,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": true,
        "fontName": "Apercu-Bold"
      },
      "body-text-1": {
        "type": "text",
        "content": "Vin de Garde (VdG) designs and builds Custom Wine Cellar Storage. Your Custom Wine Cellar has been built to suit the site, and designed to maintain conditions for long term wine storage.\n\nThis Limited Warranty covers all workmanship for a period of 2 (two) years from date of installation. VdG does not offer an extended warranty but you can purchase a service program from Vin de Garde by contacting us at 1.866.999.2103 or by email at info@vindegarde.ca.\n\nThe warranty does not cover damage by misuse or neglect of this product. The limited warranty does not cover product, repair or replacement for products not produced by Vin de Garde and/or developed by other providers. Vin de Garde will not be liable for resulting damages to equipment developed by other providers.\n\n The Limited Warranty covers parts manufactured by Vin de Garde only. The end user can contact Vin de Garde by phone or email with subject “notice for repair” regarding repairs. Vin de Garde will reply within 5 business days of notice for repair. End user can contact Vin de Garde by phoning 1.866.999.2103 or email to info@vindegarde.ca\nNo other warranty or agreement made outside of this manufacturer warranty statement is binding or supersedes your compliance regulations.\n\n If you have questions regarding your Custom Wine Cellar, contact us by phoning 1.866.999.2103 or email to info@vindegarde.ca",
        "position": {
          "x": 42,
          "y": 95
        },
        "width": 106,
        "height": 84,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1.2,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": false,
        "fontName": "Apercu-Light"
      },
      "sign-off": {
        "type": "text",
        "content": "Sincerely,",
        "position": {
          "x": 42,
          "y": 219
        },
        "width": 34,
        "height": 4,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1.3,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": false,
        "fontName": "Apercu-Light"
      },
      "billy-carpenter": {
        "type": "text",
        "content": "Billy Carpenter",
        "position": {
          "x": 42,
          "y": 225
        },
        "width": 45,
        "height": 4,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": false,
        "fontName": "Apercu-Regular"
      },
      "principal": {
        "type": "text",
        "content": "Principal",
        "position": {
          "x": 42,
          "y": 229
        },
        "width": 45,
        "height": 4,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": false,
        "fontName": "Apercu-Light"
      },
      "contac-infoa": {
        "type": "text",
        "content": "Tel: (913) 999 9999\nforms@vindegarde.ca\nwww.vindegarde.ca",
        "position": {
          "x": 135,
          "y": 225
        },
        "width": 37,
        "height": 13,
        "rotate": 0,
        "alignment": "left",
        "verticalAlignment": "top",
        "fontSize": 8,
        "lineHeight": 1,
        "characterSpacing": 0,
        "fontColor": "#191818",
        "backgroundColor": "",
        "opacity": 1,
        "strikethrough": false,
        "underline": false,
        "required": false,
        "readOnly": false,
        "fontName": "Apercu-Light"
      },
      "field131": {
        "type": "image",
        "content": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASgAAAC7CAYAAADWggNAAAAACXBIWXMAACxKAAAsSgF3enRNAAAXEUlEQVR4nO2dT3bkNpLGP/j1vuQTmHMCy7vZNb2apdUncNYJWj5Bp09g1a53Zp3A0gmaeQIrT+DM5aym8gSYBYIqKggy+QckQOb3ey9fFZgSgVSSHyMCgYCx1oIQQvpijLkDcA/gi7X2dda+KFCEkL6IOJ0AfJBD/7DWPs/V3zdznZgQsknu8VWcAOBxzs4oUISQIdyr9mnOzihQhJAh3Kn2ac7OKFCEkGShQBFChkAXjxCSLHTxCCHJogVqVpgHRQjpjTFGC8a31tovs/VHgSKE9EULlLXWzNkfXTxCSC+MMTpAfpm7TwoUIaQvOv406zo8gAJFCOlPtnSHFChCSF8y1S7n7pACRQjpS7Z0hxQoQkhfMtUu5+6QAkUI6Uu2dIfMgyKE9GLpHCiAFhQhpAcxcqAAChQhpB+L50ABFChCSD9y1T4t0SkFihDSh0y1T0t0SoEihPQhU+1yiU4pUISQPvxdtWcrsVKHaQaEkE6MMRmAv+rHlkgxAGhBEUKuk6n2camOKVCEkGvkqr1IigGwsEAZYzJPwhchJG0y1T4t1fEiAmWMuTPGFHB+7NMSfRJCgqGNinKpjpeyoHYAfpb//90Yky/ULyFkOt+r9mmpjpcUqDp08whZAR5j4mKtPS3V/+wCJVOUWoGf5+6XEBKETLUXC5ADy1hQD6p9XFKBCSGTyFW7XLLzJQRqp9rFAn0SQsKgwzHbsaBa3Ltyzj4JIUHR9+92BApN8/BsrV30AxJCxhE7QA7ML1A6/sTgOCHrIVr+U8VsAmWMuQPwkzpczNUfISQ4uWov7v3MaUFp64nuHSHrYrsWFCJPTxJCxiMTXN/Vj1lry6XHsaQFxfgTIeshV+3FSqzUmUWgjDEPAD7UDl2stRQoQtZDrtplhDHMZkHlql3O1A8hZB5y1S4jjAF/m+m8Udw7mTnM5XWPr0G+Z7g/8LO1dpFayoSsFV/8CZEEKnhNcl/9YgDfziEMSpByNLNeNRcAOWcTSQrI9fuA5oLc2NzjfYrQ/wL494L9nyDGxBwC9Qjgt9qho7U2WHkVqcj5IK9rguTjbK3NQo2HkLEYY14x7hq+BY7W2vs5XDzt3hVTTyhB9+r14cqPX+M7Y8zOWjt5XISMRZaRUJza+R4I7OKJyfp/6vAPY1yqCaJ0hvOXSzhT8QRXZrhush6stfnQMRESCrlXTpj+wN0qF2vtXWiBegDwR+3QIHdK4lePcCVa+n5xdUEqfYsZxS38s35sqX29CGmjFq5Iif8G8D+19tLxp4pna+1raBdP/7HLPr8kwvaI5u6lbbzg66zc6doPW2tfjTEX1ETPGHPPYDmJiVx/SV2Dxhg94/5va+0+xliA8GkGuWp3phcYY3YA9mhOaWoucq5nOCtpzIzgK94L4D0SuzgISYBctcsIY3gjmECJudord2KAML0AKAJloWuBygKck5DNIIF7vQKkjDMaR0gLKlftg7Z05A+wR7crd4YLaheBc6f0ue4CnpuQLTAqRDMnIQWq9cPJjMUewD87fv8AYD+jYmt3jltfEfKe5Bb4hxQobRU9A29WU4F2d25uYargEhdCWkhpeUudIIuFZRauzkVmzvYA/gO/OB0A/GitzWP7uYSQNLeHC2VB5apdGmNK+GNNFwCPzOQmJCmSc++A+QRK1yKveAGwY0UBQtJBYsTeEE1sJrt48uH6VBH4aK19oDgRkhzJ7h8QwoK6lqp/hLOaYn9gPWtHoSTEkaR7B4QRqLzjvSNc/aUUxEDnPcUWTEKik/r2cHMKVEriBDBz/B1yYWqrMpPXF7QL+CnU7I6koGRwD4/QibmkH94Z+Cgj8TBJoFpyJ4D0xAloClQZYQxRECHI4QQpw8Q6RMY0CkEcBvx6W8xyBybPxiBZ9w6YbkH54k8pihPQnKU4xRjEEtRKyT6gfUY1JH2rUHTxvTEmSyH35lZoce+2IVBiPe3V4armd1LiJAuZ61y2eCPId7KDK12ztkJo5y1+J4njm73bhkDBBdL0TZBqjlOu2sn42CGQJ+EjhgvTEe9nM6vYU4b2mN39wD66OMNZsiUSCszeEEm7d8BIgZKlLT6zvpw0mvnIVbuMMIZZ6LHWEXCWbSmvVwCvoR4kLcH2Tri0KT5ibSc7e1cx1oJ68hw7Jmo9Ac0voowxiNB4dtCpUxX5K+YUBPnOZzs/mY1kkzPrDBYouSl8T+ty8mhmoGUhcxljLCExxhQAfva8dYF7gDwl/MAg8dmpdnLuHTDOgtq3HC/HD2NWkvezh9IhTlzrSK4ik0Y61cPnFUVnkEBJqd62AGk5dTChqU2311m1QHWI00dWiCA92al2EqVVfAy1oPYtx1ONP+k99S6pTaMOQR4QWpy4nTsZyk61k7SegAHVDCSW0zZTVAYZTXgeVXvN4nSP5oVEcSKDaPGCkr0vhpRb6apaUE4cR3BatpZO9knRgwLNC+uB4kQGou/jz4l6PwB6CpTEcnxxj4oyyGjCslftw1pvZpk51WL76xZmI8lyrCX3qU5fC6rLejqnpsBiPelE0lVaT7UdceocYu72SlbLTrXPqT/kQghUGWAcodmrdnJrjAbgW76iY2uE9GGn2sk/tPsKVNeK+DLAOILRYj3tlx/JdGpr7Op8XqurSuIhwXE9yVUsP5JhXBUoTya2JrWbpVDt44rzg3ZQaRKg9UTGsVPtpIPjFX0sqLzjvaSq78k+fPopseYbupEmsYaLiqSFBMe1V1EsPpARTBWolMQpQ/OGPqQeBGyjJe9sH2EoZP3sVTv54HhFH4HqKg9bBhpHCAo03aFdlJGEYafaL6kuRyDp0rLcax9hKKPoFCgJOHdRBhvJBMS1a6QVrPWGTn2nDbIq9CxwVYZnFVyzoK4VIovu4skSkH+pw8eV5wn5SsSs5qIiSbFT7VXtnjNFoKInaIqloW/ctbt2QFOgihiDIOumJbUg+dynOtcEKut4rww3jNE8wxNITmlmcSh070hAfDl0pxgDGcs1geraTiiqCEhdJD2+F2vtqp4QHlZRipWkTcti+WL5kUyjVaDkSd5FtJumpS7SEet37YANb/BAFmWv2qtMuemyoDoD5LE+rIjT7+rwBdspdbupCqCpYox5MMYUxpjSGPNF/s1jjysEm1osb631v+ESBf9o+b2jtXbxbaplxq5Ec/Hsj2t8OmjkwvpP/Zi1trHPOBmPPOD28BdfPFtrsyXHMwfGmBLvBWq1n6ur5G+XAC3u3nWI08ctiJOQq/ZLjEFsEQlZFOhe+N61t+AqaFnWsl98IIEYUlGzzqIC1SFOn5ZYCGyMyeWLnxvt3pUL9Ll5RJxKdIsT4EIFa6dQ7fOKF8t3ClTe8d5iAtUhTp+ttcEXAhtjMmPMozHmWWITFs7t+ssYYyVukc3Q7x2asy6MP02kJk6+JVtn1V71bOmWSg1VjLKglnKprojTLmQ/xpi9MeYVwF9wu/X+5OkXcLOHf0ksIyS5ap/XlrOSKAWa4nQG8AOaFqpur429aq/aegLGbdx5DD4KD3OLkzxtHuQ1JvbwuzHmNWCOUq7aZaDz3ixSy127dUe4nXC+yDVWp1xkYDOwResJAGCt9b4AfAFgPa+i7XdCveDymYL3DSdGRcdna3udWo6XAT/zqzr3bu6/85ZfcKsg9Pf8BcCdvH/n+T7vYo97wufV1+gp9phCvLpcvLYdhGf101vynIARlpMx5s4Ys5N4koVLm/gZ7Z+t4gjgE4AfrLXGuinabwH8qn7u756n8GBa4k/l1PPeOAWa33Nuv+bK5eq96GtLxyKWovYCdhGGEpwxLt5sAtWxrXdvcZIA9gPcF9RVy0pzgAtKP1tP7Ecu3r1nAWaO6X+TXLUZf5qA5PBpd+dX+94d34R717HrT7n8aMKThEBdyVH51V4pnSJWzA7uRh8iSi/4Kkp9n54F3pd3yTE9S3cTN0tC6O/DV34nV+1yrsHMzBOaluIuwjhmYahABTeDxeJ5hl9YPtqWWQh5SuYYFuSuinU92/H1lUq8F6hraxb7kKv2qqe7YzKgLr22sMo5xjMnEhjXHsenLVnfXoHqWJMU9MbpmKmr1tY91362Kl2ay7/X4kgVZ3wVpXLaiAG4YGSdrooPfaEFFYCObbpK9XO5+pnL2m7qmtdR54wtzNzVGGpBBROojmD4BS6Y+SrWVQ4nSNeygOsc8VWUgoqqtfZkTLjlcSLS78Q29JhvCF3eFvDfsFtYkP0Ej6W41kB/G1EEqiMYXpVMyeVnhsaTSrQEuefEGJNN6DNT7cO00dwmLbv6tBVoy1W7DD6gGZHwhr5/XiaELZJlqECdpnR2Jd4EuJv1z56nu0AECcvvF3fAe9cuw/i/jXbvaD2NY48em5yuPaVDLO5CHd5CmWsvgwRqiushql+gO3Z0La4UIsidGrlqU6AGIjettiieWh5avoqlp1kGFpha3EnfJw9bc+0qhgjUaNdDZlb0zit9qYLcxUZjM9qCOsUYxMrRaQUXz7GKXLXX9KAr0LT+Pm0l58nHEIE6DT15bdeVoTNdR7gvo9yoKAF4+/voAHkZZzTrpGUNWleweJUlbSQmqyeKDnaGih4pMatAwT3F+opTlTRZrsXkDoC2nnT5D3KdQrVbV/D7ZkyxAoFqqcF/RlNsN8cQgSpHnD/veK+KJ5VYPsidCplqnyKMYbWMWIOm33tJ/brrqMG/2bhTnbktKM0ZXwVpTb6/JkT2ONAUqDLQeTfPyDVouWp3/Wx0OnIFd1sOfdTpLVBj3C5rbSYxghwzJE1GRAcqx36uXLVPI89zi+wxYA2apLispmJphzh9XPnDfRB9BWr0DJ480cqxv78GAprap0Dn2TQSS/qnOnxtDZqO1xxTjXV2zHq3rk3dKm0CNbnG0VYJXI9cTyCcAp57y/jSCvZXfmen2kWgsQSlY5XFzYkT0C5Q2ZKDWBmZagdbmpLqEz0lJDA+JK1gFe7dlc0dblKcgPZNE2hBtaP/NqPcO8+KeqYYXKEjMF5c+dWk3TtxWV9BcWrQJlDZkoNYGZlqhwr8nwKdZ8sUaAbG+yQq7jznSQKxCP9EM13iAldyulh8UAnRJlCr32F1RkItTQliid0KYnHqTOpP12aGU3XvZP/FEm6LM02188xWZr1H0xCojmJ1xBGq+oDOpbr5i7GNicXZtIU1yb2TPRR3Y39fzvEI9337Vlm8gOL0hs+CCpWEuDkCF5fj37k/e4wvzqbjT8XYQdTWlv4uu07vBv7+zhhzgrOafJU7frHW3kSGeF98s3gMkLej/zZTZvBYB6oHYtHrnKdexdnkd7WwFROGs6+d7wOcUN1Za9sqJ9R3GfIty6k44oayw4fgE6jMc+w07zBWQ67aZcBz86mpaHHthhRn0z83de1d7jn2m7hsz3j/HWZwD6FrVWGv7lp0y1CghrHKUh0rxld3e9dHZETcdMLj6OC4WGNtYvMdmlbeNQ5wn+U0dky3gC8GlS09iDXQEn8qJ5ySheo6CFB3Wz9MLmOn7EXsWt24gbwA+NFam1OcruOzoJhi4Edf8FMzyLXYnSaebzNI3KZQh4fW3dazd/p8fcfSluH9C5zL12e3oWqXoYLf8zDeCZRYCcSPFqjouTQb5hkT6m63uGODLSA5T4HmQ/tFAuNPImA5/JNLJYBXzsqNR1tQnPr2kGqy3xYxxjxhet3tnWofhlgu8n3v0b01GoC3ShbP4PUwC1qgaEH5SXot11aQuJMONh+H1N1uCY4XA/rfod1tqzK8aREtBC2ofgSJZ1TITURqdOz3NrTutv6uOoPj0u9O+umKv76g5wwiCYcWqDzGIFJGLmB94U4150MmfK6ejv3exkzDa4FqxJ4GiBLgltQ83lIVy5QYurPwLaIv+EHxDNKLZ/jjToNEQZaeaJEr5L0M1zO665wB7G+9mkBsGIPqQJ7swdZykSZSQVIvmh2739tetT8DuJfAe590AMC5cgUtpjTQAnVt6/Fb4wHv/ybVVlkkALJERAe0jxix31vLujtfsqePA9yD51a3P0uWN4FiDpSXvWrzAg6EuGO6FtIF4wPRe8+xrgdutXv1M132dKlbUJxZqiFTzvqJvI8wlM3RsaXSqDpILduf+zjDiRIzuldCXaCyWINIFAbHZ+DKfm9jy43sr7x/APDEuNL6oEB5aHki75cfyba4Ik7FyHNmaLeeDnAzceWYc5P40MXzs1ftY+CLXMdYsoDnTpIOcfp14lT+3nPsAidMoSoQkEjUBYpBcrRaT0EvdGvtqzGmfmjTFSQ6xOlzgGJt+rq9gDW9N0Pbri63zF61z0zWG4+kErSJ0y5AF2Xt/xSnjVG3oPrMgmwaxp7C0rGNd8gytwWcy3wCUHIiY1twqct7tCt3pPU0nNruJ76HXtCdcsVaosW0Ub4B3mZCbhqJk+j1YGOWW4ztfxOTFLVtvGcXJ7J9qhhUFnMQsRFx2KvDh5mnp4+qvfpJiivbeP9IcSJDoYvn8K1wn9t62sySmVq5FN+CXO75RkZTWVB5zEHERNzbf6nDn3lD9UOWBJ3gFydu400mwTQDfxXHJWJPJ9XOF+gzGMaYzBhTAvgD3MabzETl4m0iQDsUefo3kjIXuqlOC/QRHHHnHtG0OivOcDuw0Goik6ksKB2g1QHczdGyrfYx4jbUST8kjDF3xpg9nLC2idMnAPcUJxKKNhfvFszyPZquyWJpBWhum57kLJ5HmHzu3Blulu6RLh0JyU26eJIxrrc3Grr3WmiS+g4kn+kRzaqidS5wLvF+qXGR26KyoHSCYrnwOBajxbW7YPklLSfV/t4Yc5KE0ShI4PvRGPMKl8/0M9rF6TOAjOJE5uQWZ/Ge0Mx5Wny/M1kzdlGHvwPwuzHmizGmkCD+rBhj7mui9BdcGV79wKrzGcB/WWu5RxyZnZtK1JQbXi9efYlYaXEHN02v+QA3zp+NMRc4i7aEWww7OgAt1uO9vHJ59dko4wJndT5xMS5Zkr9JPKbOJmfwJCGzUIcvcCIRBWvtszHmRzj3sq2axAe4JMifAEDqSB3hJjJe8X5C4xXNYPs9XHzrHsN37TnCWZzcLIJEwWdBbfVCLNC8QaMnEkpgPu8ZlK6oXLA5SuSc4SoRFEwXILG5CRdPpsn1zRx71u4dIga72mahD+i/2eRUDnCiNMmFJCQ0mxcocWF1YuFx5M61syMWXYGvW3bn+BovGuOmac5wruArnCCVE89HyGxsWqAk7qQD4FHjTkMRASmrdi3QXf1bJ0czLvUWq6J1RNZGm0Blqr3WuNQzPNnia75RxcIqpcl93simacuDylR7dTe01MPW+TyfWTSNkPWwyURNqeyo852OgXYRIYQsxOYESpIxf1OHL3CzYoSQFbEpgZJcosLzVs4MaELWxzfYyDbcMrtVohkU/7jmoDght8w3npt3ddtwd4gTg+KErJi+s3jJUhMn34zdbvEBEUKCUQnUQR1fkxX1hKY4HbFsdUxCyAxUAnWKOYixSK5TI50ALii+1uRSQohQCdTqgsgt4nRBAhUKCCFhqASqjDmIoXSIE9MJCNkQ3wBvpT50+dkkuSJOq7MECSHt1Gfxkl94SnEi5LZYjUBRnAi5Pd7KrUh97AumF0QLSkeeE8WJkI2jEzWfooyiBYoTIbeNT6CSCJbLwt9XUJwIuVneCZTkD0W3oqQOd4lmRnuVhElxIuQGMNba5kFjTvgqDhe4La4XSX6Urb9/97zFDHFCboy2xcI5gE9wO4AslpltjHmCX5wOoDgRcnN4LajFB+GC4c/wb0TJqgSE3CjRK2rWguE+cfqF4kTI7RJVoCTe9CeawfALgH9Ya6MH7Akh8Yjq4hljfGkERwA7ztQRQmILlO78BU6cGAwnhESPQR3gLCbAxZtYy4kQ8kYSs3iEEOLj/wEO9GHvCvxL0wAAAABJRU5ErkJggg==",
        "position": {
          "x": 42.33,
          "y": 194.77
        },
        "width": 28.89,
        "height": 21.46,
        "rotate": 0,
        "opacity": 1,
        "required": false
      }
    }
  ],
  basePdf: { width: 210, height: 297, padding: [0, 0, 0, 0] },
  pdfmeVersion: "4.0.0",
});


export const getTemplatePresets = (): {
  key: string;
  label: string;
  template: () => Template;
}[] => [
  { key: 'invoice', label: 'Invoice', template: getInvoiceTemplate },
  { key: 'blank', label: 'Blank', template: getBlankTemplate },
  { key: 'proposal', label: 'Proposal', template: getProposalTemplate },
  { key: 'custom', label: 'Custom', template: getBlankTemplate },
];

export const getTemplateByPreset = (templatePreset: string): Template => {
  // Get the list of template presets
  const templatePresets = getTemplatePresets();
  
  // Find the preset that matches the given templatePreset key
  const preset = templatePresets.find((preset) => preset.key === templatePreset);
  
  // If a matching preset is found, return its template, otherwise return the template of the first preset in the list
  return preset ? preset.template() : templatePresets[0].template();
};

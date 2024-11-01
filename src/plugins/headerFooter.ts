import { Plugin, Template, InputType } from '@pdfme/common';

const headerFooter: Plugin = {
	name: 'HeaderFooter',
	uiSchema: {
	type: 'group',
	label: 'Header & Footer',
	children: {
		header: {
		type: 'group',
		label: 'Header',
		children: {
			content: { type: 'text', label: 'Content' },
			height: { type: 'number', label: 'Height' },
		},
		},
		footer: {
		type: 'group',
		label: 'Footer',
		children: {
			content: { type: 'text', label: 'Content' },
			height: { type: 'number', label: 'Height' },
		},
		},
	},
	},
	renderPDF: ({ schema, value, position, fontRegistry }) => {
	const { header, footer } = value;
	const pageHeight = position.maxY - position.minY;
	const headerHeight = header.height || 20;
	const footerHeight = footer.height || 20;

	const headerContent = [
		{
		text: header.content,
		x: position.minX,
		y: position.minY,
		width: position.maxX - position.minX,
		height: headerHeight,
		},
	];

	const footerContent = [
		{
		text: footer.content,
		x: position.minX,
		y: position.maxY - footerHeight,
		width: position.maxX - position.minX,
		height: footerHeight,
		},
	];

	return {
		content: [...headerContent, ...footerContent],
		clip: {
		x: position.minX,
		y: position.minY + headerHeight,
		width: position.maxX - position.minX,
		height: pageHeight - headerHeight - footerHeight,
		},
	};
	},
};

export default headerFooter;
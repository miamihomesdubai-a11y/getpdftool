type Guide = { title: string; intro: string; steps: string[]; limit: string; example: string; help: string };

export const TOOL_GUIDES: Record<string, Guide> = {
  "/": {
    title: "Add notes to a PDF and save a separate copy",
    intro: "Use the editor to add visible text, highlights and drawings to an existing document. Page tools help fix orientation or remove unwanted pages. Adding a text box is different from changing the underlying document’s original text.",
    steps: ["Choose a PDF or drop it into the editor. Keep an untouched copy on your device.", "Select the text, drawing or highlight tool, then place the annotation on the page. Review its size, colour and position.", "Save your changes and download the result. Open the downloaded PDF in another reader and check every changed page."],
    limit: "Drawing over information is not secure redaction. Hidden or underlying text can remain recoverable. Password-protected files may need to be unlocked with an authorised PDF application first. Editing a digitally signed document can invalidate its original signature.",
    example: "To return comments on a draft report, add a short note beside the paragraph and highlight the relevant sentence. Download a new copy with a name such as report-comments.pdf so the original remains available.",
    help: "If text appears in the wrong place, check the page orientation and try a shorter text box. If the document will not open, try a small, unprotected PDF to distinguish a file problem from a browser problem."
  },
  "/pdf-to-word": {
    title: "Recover editable text from a PDF",
    intro: "This converter extracts a PDF’s existing text into DOCX paragraphs. It is useful when you need to rewrite a letter or reuse the wording of a report. It does not recreate the original document’s full design.",
    steps: ["Open the PDF in a reader and try selecting a sentence. Selectable text is a useful first check that the document has a text layer.", "Choose the PDF here and select Convert to Word. Let the browser finish before closing the tab.", "Download the DOCX, open it in your word processor and check the text, page breaks and reading order."],
    limit: "Image-only scans need OCR first; OCR is not provided by this tool. Original fonts, tables, embedded images and multi-column layouts are not reproduced as an exact editable layout.",
    example: "For a two-page letter, extract the text, correct any unusual spacing, and apply your own heading and paragraph styles in Word. If you only need to preserve appearance, use PDF to JPG instead.",
    help: "Blank output usually means there is no extractable text. Jumbled paragraphs can come from columns or unusual font encoding. Compare with the PDF and correct the order manually; do not rely on conversion for critical numbers without checking them."
  },
  "/pdf-to-excel": {
    title: "Move PDF text into spreadsheet cells",
    intro: "The converter creates one worksheet for each PDF page. Text lines become rows, and separate text items become cells. This is a starting point for organising information, rather than automatic recognition of accounting tables.",
    steps: ["Choose a PDF with an existing text layer.", "Run Convert to Excel and download the XLSX file.", "Open each worksheet. Rebuild column headings, check amounts and dates, and remove extra spacing or empty cells."],
    limit: "Scanned tables require OCR elsewhere. Formulas, original cell types, merged cells and precise table structure are not recovered. Values may be imported as text, so totals must be checked before calculations.",
    example: "A price list can become a worksheet that you tidy into Item, Quantity and Price columns. Compare several rows against the original before applying a sum or sorting the list.",
    help: "When a row splits into several cells, combine or move the text in your spreadsheet editor. If output is blank, check whether the source is an image-only scan. Never assume a converted financial total is accurate."
  },
  "/pdf-to-powerpoint": {
    title: "Put PDF pages into a slide presentation",
    intro: "Each PDF page is rendered as an image on a PowerPoint slide. This preserves the page’s appearance for presenting or reference, but the words and shapes inside the image do not become separate editable slide elements.",
    steps: ["Choose the PDF containing the pages you want to present.", "Convert to PowerPoint and wait for the pages to render.", "Download the PPTX and open it in your presentation software. Check slide orientation and image clarity before presenting."],
    limit: "Slide size follows the first PDF page. Later pages with different proportions are fitted within that size. The result is image-based; text is not separately editable and the slides may be larger than the original PDF.",
    example: "Convert a landscape handout into a reference deck, then add a title slide and speaker notes in PowerPoint. For a portrait document, expect portrait-shaped slides rather than an automatic widescreen redesign.",
    help: "If small text is hard to read on a projector, use fewer details per page or zoom the source before preparing your final presentation. Mixed page sizes may leave empty margins."
  },
  "/pdf-to-text": {
    title: "Extract text for searching and reuse",
    intro: "Create a plain-text copy of a text-based PDF. This removes page styling and leaves wording you can search, copy or organise in another application. Page separators help show where the original pages ended.",
    steps: ["Choose a PDF that contains selectable text.", "Run the text conversion and download the TXT file.", "Open the file in a text editor and compare the reading order, names and numbers with the original."],
    limit: "Pictures, signatures, fonts and table structure are not included. Image-only scans need OCR first. Multi-column documents can produce text in an unexpected order.",
    example: "Extract the wording of a meeting handout so you can search for a date or copy a short quotation. Keep the original PDF for diagrams and formatting.",
    help: "If no words appear, try selecting text in the source PDF. Where columns are mixed together, rearrange the output manually and check that no lines were missed."
  },
  "/pdf-to-jpg": {
    title: "Turn PDF pages into images",
    intro: "Render each page as a JPEG for a presentation, message or image workflow. A one-page PDF produces a JPG; multiple pages are packaged in a ZIP. Image conversion preserves visual content but removes selectable text.",
    steps: ["Choose your PDF, then select Low, Medium or High image quality.", "Convert to JPG. Higher quality takes more memory and can create larger files.", "Download the output. Extract a ZIP before opening its individual page images."],
    limit: "JPEG uses lossy compression and does not preserve live links, form fields, selectable text or document accessibility features. A larger image cannot recover detail missing from a blurry source scan.",
    example: "For a two-page flyer, convert to medium quality and extract page-001.jpg and page-002.jpg. Inspect small text before sharing the images in a message.",
    help: "If an image is too large for your destination, try a lower quality setting. If the browser runs out of memory, process a shorter document or fewer pages at once."
  },
  "/word-to-pdf": {
    title: "Create a PDF from a DOCX document",
    intro: "This tool converts DOCX content to a browser-rendered PDF. It is useful for simple letters, notes and documents when you want a PDF copy without installing a separate converter.",
    steps: ["Save the source as a .docx file; old .doc files are not supported by this tool.", "Choose the DOCX and convert to PDF.", "Download and inspect the page breaks, tables, pictures and text before sending."],
    limit: "The browser rebuilds the document from its content. Exact Word pagination, fonts, headers, footers and advanced formatting may change. For an exact match, use Word’s own Export to PDF feature.",
    example: "Convert a simple covering letter to a PDF attachment. Check that the final paragraph and signature area remain on the intended page.",
    help: "If a complex document looks different, simplify its layout or export from the application that created it. Missing fonts and wide tables often cause reflow."
  },
  "/excel-to-pdf": {
    title: "Create a readable PDF copy of a workbook",
    intro: "Workbook sheets are rendered as tables in a PDF. The output is suitable for viewing or sharing static cell contents, rather than continuing to calculate or edit a spreadsheet.",
    steps: ["Choose your .xlsx workbook.", "Convert it and download the PDF.", "Check each sheet’s heading, visible cell values, table width and page breaks."],
    limit: "Charts, macros and Excel’s print layout are not reproduced exactly. Formulas are not recalculated here; save a freshly calculated workbook in Excel first. Wide sheets may need a different export method for readable printing.",
    example: "Make a PDF copy of a short stock list, then check that its item codes and quantities are legible. Keep the XLSX as the editable master file.",
    help: "If numbers appear out of date, recalculate and save in your spreadsheet application. For complex workbooks, use that application’s Print or Export to PDF settings."
  },
  "/jpeg-to-pdf": {
    title: "Combine JPEG and PNG images into a PDF",
    intro: "Each selected image becomes a PDF page at its source dimensions. This is useful for grouping photos of receipts, sketches or scanned pages into one document.",
    steps: ["Choose JPEG or PNG files and check their order in the tool.", "Convert the selected images to PDF.", "Download the PDF and check page order, orientation and readability."],
    limit: "Images remain images; the PDF is not automatically searchable. Different image dimensions can produce different page sizes. Converting does not improve an out-of-focus photograph.",
    example: "Combine three clear receipt photos into a single expense attachment. Make sure the dates and totals are readable and no personal details are included unnecessarily.",
    help: "If a phone photo is HEIC, convert it to JPEG or PNG first. Rotate or crop the original images before converting if their orientation or edges are wrong."
  },
  "/html-to-pdf": {
    title: "Make a PDF from simple HTML",
    intro: "Paste HTML or choose an HTML file to render its content into PDF pages. This works best for a self-contained document with straightforward text, tables and styling.",
    steps: ["Use HTML you trust and are authorised to process. Paste the markup or choose an .html file.", "Convert the content and download the PDF.", "Inspect image loading, spacing and page breaks before distributing the result."],
    limit: "This is not a full website archiver. Scripts, remote fonts, images and complex CSS may behave differently or fail to load. Remote resources referenced by HTML can make requests to external servers, so avoid them for sensitive material.",
    example: "Convert a simple static event schedule into a PDF handout. Use self-contained content and check that a table does not break across pages in an awkward place.",
    help: "If a remote image is missing, cross-origin restrictions may prevent it from rendering. Simplify the markup or use the browser’s own Print to PDF for a page already open in your browser."
  },
  "/compress-pdf": {
    title: "Choose compression without losing information you need",
    intro: "Compression results depend on how the source PDF was built. A scanned document may benefit from image compression, while an already compact text document can become larger if every page is turned into an image.",
    steps: ["Open the PDF and note the original file size.", "Try High quality first to preserve selectable text. Recommended renders pages as JPEG images at 150 DPI.", "Compare the result’s size and legibility. Download only if it suits your needs; keep the original."],
    limit: "There are two settings. High quality re-saves the structure; Recommended makes image-based pages and can remove searchable text, links and interactive fields. Reduction is not guaranteed, and rasterising digitally signed PDFs can discard signature information.",
    example: "If a scanned handout is too large for an attachment, try Recommended and inspect small print. For a text report where copying words matters, use High quality and accept that savings may be small.",
    help: "If the output is larger, use the original or another setting. Do not repeatedly compress an image-based result, because repeated JPEG encoding can reduce clarity."
  },
  "/sign-pdf": {
    title: "Place a visible signature on a PDF",
    intro: "Add a signature image, date or company stamp to a page. This is a visual signing workflow for documents where the recipient accepts that format.",
    steps: ["Open the PDF and locate the signature area.", "Choose a clear signature image, place it on the page, and adjust its size. Add the required date or stamp.", "Save changes, download the file and check the signature location before sending it to the recipient."],
    limit: "A pasted signature image is not a certificate-backed digital signature or proof of identity. This tool does not provide a signer audit trail or guarantee legal acceptance. Follow the recipient’s signing requirements and use only signatures you are authorised to apply.",
    example: "Place your own signature on a routine acknowledgement after confirming that a scanned signature is acceptable. Keep your signature image private.",
    help: "A PNG with a transparent background usually avoids a white box around the signature. If a recipient requires identity verification or a digital certificate, use their specified signing service."
  },
  "/watermark-pdf": {
    title: "Mark a document’s status clearly",
    intro: "Add a text label or logo to selected pages so recipients can recognise a draft or reference copy. Position and opacity help keep the document readable.",
    steps: ["Open the PDF and enter watermark text or choose a logo image.", "Adjust placement, rotation, opacity and page selection. Inspect a busy page as well as a mostly blank one.", "Save and download a new copy, then check that the watermark does not cover important wording."],
    limit: "A watermark is a visual label, not access control, encryption or secure redaction. It does not prevent copying or prove ownership. Changing a signed document can affect existing digital signatures.",
    example: "Mark a proposal DRAFT before an internal review. Use low enough opacity to keep figures and diagrams legible, and retain an unmarked original.",
    help: "If the mark obscures content, reduce opacity or move it. For a faint logo, use a clearer source image rather than repeatedly exporting the watermarked copy."
  },
  "/organise": {
    title: "Arrange pages before sending your document",
    intro: "Work with thumbnails to reorder, rotate, copy, add or delete pages. This is useful when several scans need to become one ordered document, without changing the wording on each page.",
    steps: ["Open the first PDF and inspect its page thumbnails.", "Add other pages where needed, then select or drag thumbnails to arrange them. Check the first and last page after each batch change.", "Save changes, download a new PDF and review the whole sequence."],
    limit: "Page numbers printed inside the document are not automatically rewritten. Bookmarks, interactive forms or digital signatures may not survive every page operation unchanged. Check these separately when they matter.",
    example: "Put a covering letter before supporting documents and remove an accidental blank scan. Download a separate submission copy so your source documents remain intact.",
    help: "If pages appear in the wrong order, check thumbnail order before saving. Use smaller batches for large scans, and keep an original copy before deleting anything."
  },
  "/merge-pdf": {
    title: "Combine PDFs in the right order",
    intro: "Merging puts pages from separate PDFs into one file. It does not rewrite their contents or automatically unify their fonts, paper sizes or printed page numbers.",
    steps: ["Open a PDF in the organiser and add the other PDFs.", "Inspect the thumbnail sequence and drag pages into the intended order.", "Save changes and download the combined document. Check page count and orientation."],
    limit: "Mixed page sizes stay mixed. Protected PDFs may need authorised unlocking first. Rebuilding a document can affect digital signatures, bookmarks and form behaviour.",
    example: "Combine a cover letter with two supporting PDFs, with the letter first. Check that both sides of any scanned sheet are included before submitting.",
    help: "If the result is too large to share, inspect it first, then consider compression. For a failed merge, try combining two small unprotected PDFs to identify whether one source file is the problem."
  },
  "/add-pdf-pages": {
    title: "Insert a missing page without rebuilding everything",
    intro: "Add blank pages or pages from another PDF, then move them into position in the organiser. Adding pages changes the sequence but does not update printed page numbers.",
    steps: ["Open the destination PDF and locate the gap in its thumbnail sequence.", "Add a blank page or another PDF, then drag the inserted pages into position.", "Save and download a new copy. Check the pages immediately before and after the insertion."],
    limit: "Inserted pages can have a different size or orientation. Check forms, bookmarks and existing digital signatures if the document uses them.",
    example: "Insert a missing appendix after the final report page, or add a blank notes page between sections. Keep the original file as a reference.",
    help: "If pages were added at the end instead of the desired location, move their thumbnails before saving. Rotate sideways scans using the page controls."
  },
  "/delete-pdf-pages": {
    title: "Remove unwanted pages carefully",
    intro: "Select pages in the organiser to remove blank scans, duplicates or an unnecessary section. Deleting an entire page is different from securely removing selected information within a retained page.",
    steps: ["Open a copy of your PDF and identify unwanted pages by their thumbnails.", "Select the intended pages, verify the selection, then delete them.", "Save and download. Reopen the result and check both the page count and the surrounding content."],
    limit: "Deletion does not automatically renumber printed headings or repair bookmarks and references. Do not use a drawing box to hide confidential text; that is not secure redaction.",
    example: "Remove an accidental blank scan from a document packet. Make sure it is actually blank rather than a faint reverse side before deleting it.",
    help: "If you removed the wrong page, restart from the unchanged original. For confidential documents, check the complete final file, including attachments and metadata, with an appropriate document review tool."
  },
  "/copy-pdf-pages": {
    title: "Duplicate a page and keep the sequence clear",
    intro: "Copy selected pages within a PDF, then move their thumbnails to the right positions. This is useful for reusable worksheets or repeated instruction pages.",
    steps: ["Open the PDF and select the pages to duplicate.", "Use Copy, then inspect the new pages and move them if needed.", "Save and download a separate copy. Count the repeated pages and check that none are missing."],
    limit: "Copying duplicates the page content, not a new independent form workflow. Form field names or document links may need additional handling in a specialist PDF editor.",
    example: "Duplicate a blank weekly worksheet four times for a monthly packet. Check the result before printing and use only documents you have permission to copy.",
    help: "When several copies look identical, use thumbnail position and page count to track them. If interactive fields behave unexpectedly, use a static version or a dedicated forms editor."
  },
  "/rotate-pdf": {
    title: "Fix sideways or upside-down pages",
    intro: "Rotate selected page thumbnails in 90-degree steps. Rotation changes how the page is oriented in the PDF, without rewriting the text or straightening a slightly tilted scan.",
    steps: ["Open your PDF and find the sideways pages in the thumbnail view.", "Select the intended pages and rotate them until text is upright.", "Save and download the result. Check portrait and landscape pages individually."],
    limit: "This is page rotation, not fine-angle deskewing, cropping or OCR. Rotating a photograph of text does not make that text searchable.",
    example: "Correct a landscape chart that was scanned sideways while leaving the portrait report pages unchanged. Reopen the download to confirm orientation is saved.",
    help: "If every page rotates unintentionally, check which thumbnails are selected. For a slightly slanted scan, rescan it or use a dedicated deskewing tool."
  }
};

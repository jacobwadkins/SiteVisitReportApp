import { Document, Packer, Paragraph, TextRun, Table, TableCell, TableRow, ImageRun, BorderStyle, AlignmentType, Footer, PageNumber, ShadingType } from 'docx';
import { saveAs } from 'file-saver';
import { Visit } from '../types';

export const generateDOCX = async (visit: Visit): Promise<void> => {
  try {
    // Constants for styling (matching PDF)
    const colors = {
      navy: '172554',
      lightGray: 'F5F5F5',
      borderGray: 'C8C8C8',
      textGray: '505050',
      footerGray: '808080'
    };
    const margin = 720; // 36pt = 0.5 inch

    // Helper functions for display numbering (matching PDF logic)
    const getDisplayNumber = (index: number, isTabbed: boolean, tabbedArray: boolean[]): string => {
      if (isTabbed) return '•';
      
      let count = 1;
      for (let i = 0; i < index; i++) {
        if (!tabbedArray[i]) {
          count++;
        }
      }
      return count.toString();
    };

    const getDisplayLetter = (index: number, isTabbed: boolean, tabbedArray: boolean[]): string => {
      if (isTabbed) return '•';
      
      let count = 0;
      for (let i = 0; i < index; i++) {
        if (!tabbedArray[i]) {
          count++;
        }
      }
      return String.fromCharCode(97 + count);
    };

    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: {
              top: margin,
              right: margin,
              bottom: margin,
              left: margin,
            },
          },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Page ',
                    size: 16,
                    color: colors.footerGray
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 16,
                    color: colors.footerGray
                  }),
                  new TextRun({
                    text: ' of ',
                    size: 16,
                    color: colors.footerGray
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    size: 16,
                    color: colors.footerGray
                  }),
                  new TextRun({
                    text: '\t\t\t\t\t\t\t\t\t\tHaskell',
                    size: 16,
                    color: colors.footerGray
                  })
                ],
                alignment: AlignmentType.LEFT,
              })
            ]
          })
        },
        children: [
          // Header: Title bar with company branding
          new Paragraph({
            children: [
              new TextRun({
                text: 'Site Visit Report\t\t\t\t\t\t\t\t\t\tHaskell',
                bold: true,
                size: 44,
                color: 'FFFFFF'
              })
            ],
            shading: {
              type: ShadingType.SOLID,
              color: colors.navy,
              fill: colors.navy
            },
            spacing: { after: 400 },
          }),

          // Info Box: Table layout
          new Table({
            width: { size: 100, type: 'pct' },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Client: ', bold: true, size: 20 }),
                          new TextRun({ text: visit.clientName, size: 20 })
                        ]
                      })
                    ],
                    shading: { fill: colors.lightGray },
                    margins: { top: 100, bottom: 100, left: 200, right: 100 },
                    width: { size: 50, type: 'pct' }
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Date: ', bold: true, size: 20 }),
                          new TextRun({ text: new Date(visit.visitDate).toLocaleDateString(), size: 20 })
                        ]
                      })
                    ],
                    shading: { fill: colors.lightGray },
                    margins: { top: 100, bottom: 100, left: 200, right: 100 },
                    width: { size: 50, type: 'pct' }
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Site: ', bold: true, size: 20 }),
                          new TextRun({ text: visit.siteName, size: 20 })
                        ]
                      })
                    ],
                    shading: { fill: colors.lightGray },
                    margins: { top: 100, bottom: 100, left: 200, right: 100 },
                    width: { size: 50, type: 'pct' }
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Prepared by: ', bold: true, size: 20 }),
                          new TextRun({ text: visit.preparedBy, size: 20 })
                        ]
                      })
                    ],
                    shading: { fill: colors.lightGray },
                    margins: { top: 100, bottom: 100, left: 200, right: 100 },
                    width: { size: 50, type: 'pct' }
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Project No.: ', bold: true, size: 20 }),
                          new TextRun({ text: visit.projectNo, size: 20 })
                        ]
                      })
                    ],
                    shading: { fill: colors.lightGray },
                    margins: { top: 100, bottom: 100, left: 200, right: 100 },
                    width: { size: 50, type: 'pct' }
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: '' })],
                    shading: { fill: colors.lightGray },
                    margins: { top: 100, bottom: 100, left: 200, right: 100 },
                    width: { size: 50, type: 'pct' }
                  })
                ]
              })
            ],
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: colors.borderGray },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: colors.borderGray },
              left: { style: BorderStyle.SINGLE, size: 1, color: colors.borderGray },
              right: { style: BorderStyle.SINGLE, size: 1, color: colors.borderGray },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: colors.borderGray },
              insideVertical: { style: BorderStyle.SINGLE, size: 1, color: colors.borderGray },
            }
          }),

          new Paragraph({ text: '', spacing: { after: 640 } }),

          // Background Section
          ...(visit.background ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: '1. Background & Purpose',
                  bold: true,
                  size: 28,
                  color: colors.navy
                })
              ],
              spacing: { after: 500 },
              border: {
                bottom: {
                  color: colors.navy,
                  space: 1,
                  style: BorderStyle.SINGLE,
                  size: 6,
                }
              }
            }),
            new Paragraph({
              children: [new TextRun({ text: visit.background, size: 22 })],
              spacing: { after: 400 },
              indent: { left: 200 }
            })
          ] : []),

          // Observations Section
          ...(visit.observations ? (() => {
            const lines = visit.observations.split('\n').filter(line => line.trim());
            const tabbedObservations = lines.map(line => line.startsWith('\t') || line.startsWith('    '));
            
            return [
              new Paragraph({
                children: [
                  new TextRun({
                    text: '2. Site Observations',
                    bold: true,
                    size: 28,
                    color: colors.navy
                  })
                ],
                spacing: { after: 500 },
                border: {
                  bottom: {
                    color: colors.navy,
                    space: 1,
                    style: BorderStyle.SINGLE,
                    size: 6,
                  }
                }
              }),
              ...lines.map((line, index) => {
                const cleanLine = line.replace(/^[\t\s]+/, '');
                const isTabbed = tabbedObservations[index];
                const displayNumber = getDisplayNumber(index, isTabbed, tabbedObservations);
                
                return new Paragraph({
                  children: [
                    new TextRun({ text: `${displayNumber}${isTabbed ? '' : '.'} `, size: 22 }),
                    new TextRun({ text: cleanLine, size: 22 })
                  ],
                  spacing: { after: 100 },
                  indent: { left: isTabbed ? 600 : 200 }
                });
              }),
              new Paragraph({ text: '', spacing: { after: 300 } })
            ];
          })() : []),

          // Follow-ups Section
          ...(visit.followups ? (() => {
            const lines = visit.followups.split('\n').filter(line => line.trim());
            const tabbedFollowups = lines.map(line => line.startsWith('\t') || line.startsWith('    '));
            
            return [
              new Paragraph({
                children: [
                  new TextRun({
                    text: '3. Recommendations & Follow-up Actions',
                    bold: true,
                    size: 28,
                    color: colors.navy
                  })
                ],
                spacing: { after: 500 },
                border: {
                  bottom: {
                    color: colors.navy,
                    space: 1,
                    style: BorderStyle.SINGLE,
                    size: 6,
                  }
                }
              }),
              ...lines.map((line, index) => {
                const cleanLine = line.replace(/^[\t\s]+/, '');
                const isTabbed = tabbedFollowups[index];
                const displayLetter = getDisplayLetter(index, isTabbed, tabbedFollowups);
                
                return new Paragraph({
                  children: [
                    new TextRun({ text: `${displayLetter}${isTabbed ? '' : '.'} `, size: 22 }),
                    new TextRun({ text: cleanLine, size: 22 })
                  ],
                  spacing: { after: 100 },
                  indent: { left: isTabbed ? 600 : 200 }
                });
              }),
              new Paragraph({ text: '', spacing: { after: 300 } })
            ];
          })() : []),

          // Photos Section
          ...(visit.photos && visit.photos.length > 0 ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Site Photos',
                  bold: true,
                  size: 28,
                  color: colors.navy
                })
              ],
              spacing: { after: 500 },
              pageBreakBefore: true,
              border: {
                bottom: {
                  color: colors.navy,
                  space: 1,
                  style: BorderStyle.SINGLE,
                  size: 6,
                }
              }
            }),
            // Individual photos with captions and notes
            ...visit.photos.map((photo, index) => {
              const label = photo.description 
                ? `Photo ${index + 1}: ${photo.description.substring(0, 35)}${photo.description.length > 35 ? '...' : ''}`
                : `Photo ${index + 1}`;

              const elements = [];

              try {
                const base64Data = photo.src.split(',')[1];
                const binaryString = atob(base64Data);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                  bytes[i] = binaryString.charCodeAt(i);
                }

                // Photo
                elements.push(new Paragraph({
                  children: [
                    new ImageRun({
                      data: bytes,
                      transformation: {
                        width: 460, // 230pt * 2
                        height: 344  // 172pt * 2
                      }
                    })
                  ],
                  spacing: { after: 0 },
                  alignment: AlignmentType.CENTER
                }));

                // Caption with navy background
                elements.push(new Paragraph({
                  children: [
                    new TextRun({
                      text: label,
                      color: 'FFFFFF',
                      size: 20,
                      bold: true
                    })
                  ],
                  shading: { 
                    type: ShadingType.SOLID, 
                    color: colors.navy, 
                    fill: colors.navy 
                  },
                  spacing: { after: photo.notes ? 100 : 400 },
                  alignment: AlignmentType.CENTER
                }));

                // Notes if present
                if (photo.notes) {
                  elements.push(new Paragraph({
                    children: [
                      new TextRun({
                        text: photo.notes.split('\n').slice(0, 2).join(' '),
                        size: 18,
                        color: colors.textGray
                      })
                    ],
                    spacing: { after: 400 },
                    alignment: AlignmentType.CENTER
                  }));
                }

              } catch (error) {
                console.error(`Error processing photo ${index + 1} for DOCX:`, error);
                elements.push(new Paragraph({
                  children: [
                    new TextRun({
                      text: `[Photo ${index + 1} failed to load]`,
                      size: 20,
                      color: colors.textGray
                    })
                  ],
                  spacing: { after: 400 },
                  alignment: AlignmentType.CENTER
                }));
              }

              return elements;
            }).flat()
          ] : [])
        ]
      }]
    });

    const blob = await Packer.toBlob(doc);
    const safeSiteName = visit.siteName.replace(/[^a-zA-Z0-9-_]/g, '');
    const safeDate = new Date(visit.visitDate).toISOString().split('T')[0].replace(/-/g, '');
    const fileName = `Site_Visit_Report_${safeSiteName}_${safeDate}.docx`;
    saveAs(blob, fileName);
  } catch (error) {
    console.error('Error generating DOCX:', error);
    throw new Error('Failed to generate DOCX document');
  }
};
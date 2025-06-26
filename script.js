const MAIN_FOLDER_ID = 'ID DA PASTA PRINCIPAL AQUI';

// Em "const nome = respostas" o nome deve estar idêntico ao Forms.
function onFormSubmit(e) {
  const respostas = e.namedValues;
  const nome = respostas['NOME COMPLETO DA OSC'][0];

  if (!nome) return;

  const pastaPrincipal = DriveApp.getFolderById(MAIN_FOLDER_ID);

  // Criar ou acessar pasta da pessoa.
  let pastaPessoa;
  const pastas = pastaPrincipal.getFoldersByName(nome);
  if (pastas.hasNext()) {
    pastaPessoa = pastas.next();
  } else {
    pastaPessoa = pastaPrincipal.createFolder(nome);
  }

  // Lista de campos de upload com nomes desejados para os arquivos.
  // O campo "campo" precisa estar idêntico ao Forms.
  // O campo "nomeArquivo" NÃO precisa estar igual ao Forms.
  const documentos = [
    { campo: 'DOCUMENTOS DE IDENTIFICAÇÃO', nomeArquivo: 'DOCUMENTOS DE IDENTIFICAÇÃO' },
    { campo: 'DOCUMENTOS DE EXPERIÊNCIA', nomeArquivo: 'DOCUMENTOS DE EXPERIÊNCIA' },
    { campo: 'PROPOSTA DE ATUAÇÃO', nomeArquivo: 'PROPOSTA DE ATUAÇÃO' },
    { campo: 'CERTIDÕES E DECLARAÇÕES', nomeArquivo: 'CERTIDÕES E DECLARAÇÕES' },
  ];

  documentos.forEach(doc => {
    const arquivos = respostas[doc.campo]?.[0];
    if (!arquivos) return;

    const links = arquivos.split(', ');
    let contador = 1;

    for (const link of links) {
      const fileId = extrairIdDoLink(link);
      if (fileId) {
        const originalFile = DriveApp.getFileById(fileId);
        const extensao = originalFile.getName().split('.').pop();

        const nomeBase = `${doc.nomeArquivo} (${nome})`;
        const nomeFinal = (links.length > 1)
          ? `${nomeBase} (${contador}).${extensao}`
          : `${nomeBase}.${extensao}`;

        originalFile.makeCopy(nomeFinal, pastaPessoa);
        originalFile.setTrashed(true); // opcional
        contador++;
      }
    }
  });
}

function extrairIdDoLink(link) {
  const match = link.match(/[-\w]{25,}/);
  return match ? match[0] : null;
}

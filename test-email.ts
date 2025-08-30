// test-email.ts

import { Resend } from 'resend';

const resend = new Resend('re_fZSD3L5D_C2oGM9UjAy8k1Kd32PVKPSDA');

async function testEmail() {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Seu Nome <contato@curvaeng.com.br>',
      to: ['alexandrefpenha@gmail.com'],
      subject: 'Teste de Envio Resend',
      html: '<strong>Se este e-mail chegar, a Resend está funcionando.</strong>',
    });

    if (error) {
      console.error('Erro de envio:', error);
      return;
    }
    console.log('E-mail enviado com sucesso:', data);
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

testEmail();
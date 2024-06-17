import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiDescription, apiTitle, xTagGroups } from './constants';
import { TokenModule } from '../../token/token.module';

const setup = async (
  app,
  moduleToIncludes,
  apiDocPath,
  extraXTagGroups = [],
  version = '1.0.0',
) => {
  const options = new DocumentBuilder()
    .setVersion(version)
    .setTitle(apiTitle)
    .setDescription(apiDescription)
    .build();

  const document = SwaggerModule.createDocument(app, options, {
    include: [TokenModule, ...moduleToIncludes],
  });

  document['x-tagGroups'] = [...extraXTagGroups, ...xTagGroups];

  SwaggerModule.setup(apiDocPath, app, document);
  Logger.log(`Api document is available at ${apiDocPath}`);
};

export const setupApiDoc = async (app) => {
  await setup(app, [], 'documentation', [], '1.0.0');
};

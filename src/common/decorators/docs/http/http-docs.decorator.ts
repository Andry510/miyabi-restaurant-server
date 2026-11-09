import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';

//Infrastructure
import { HttpDocsMapper, type THttpDocs } from '@infrastructure/http';

const PICTURE_BODY = {
  schema: {
    type: 'object' as const,
    required: ['picture'],
    properties: {
      picture: {
        type: 'string' as const,
        format: 'binary',
        description: 'JPG, PNG o WEBP',
      },
    },
  },
};

export const HttpDocs = (docs: THttpDocs): MethodDecorator & ClassDecorator =>
  applyDecorators(
    ApiOperation({
      summary: docs.summary,
      description: HttpDocsMapper.description(docs),
    }),
    ...(docs.access || docs.bearer ? [ApiBearerAuth()] : []),
    ...(docs.params
      ? HttpDocsMapper.params(docs.params).map(({ name, required, schema }) =>
          ApiParam({ name, required, schema }),
        )
      : []),
    ...(docs.query
      ? HttpDocsMapper.query(docs.query).map(({ name, required, schema }) =>
          ApiQuery({ name, required, schema }),
        )
      : []),
    ...(docs.body ? [ApiBody({ schema: HttpDocsMapper.body(docs.body) })] : []),
    ...(docs.picture
      ? [ApiConsumes('multipart/form-data'), ApiBody(PICTURE_BODY)]
      : []),
    ApiResponse(HttpDocsMapper.success(docs)),
    ...HttpDocsMapper.errors(docs).map((response) => ApiResponse(response)),
  );

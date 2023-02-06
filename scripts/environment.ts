import dotenv from 'dotenv';
import dotenvParseVariables from 'dotenv-parse-variables';
import { Env } from '../.env-types';

const { error: envError, parsed } = dotenv.config({});

if (envError || !parsed) throw envError;

export default dotenvParseVariables(parsed) as Env;

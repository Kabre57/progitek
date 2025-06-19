"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testConnection = exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
}
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
const testConnection = async () => {
    try {
        const { data, error } = await exports.supabase.from('role').select('count').limit(1);
        if (error) {
            console.error('❌ Erreur de connexion Supabase:', error);
            throw error;
        }
        console.log('✅ Connexion Supabase établie');
    }
    catch (error) {
        console.error('❌ Erreur de connexion à Supabase:', error);
        throw error;
    }
};
exports.testConnection = testConnection;
//# sourceMappingURL=supabase.js.map
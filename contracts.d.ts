export type VerificationState = 'supported' | 'mismatch' | 'unverified';
export type SourceMode = 'available' | 'unavailable' | 'stale';
export type Severity = 'strong' | 'verify' | 'limited';
export interface EvidenceEvent { id:string; text:string; redactions:number; hash:string; synthetic:boolean; source:string; createdAt:string; completeness:'user-supplied'; basis:'observed'|'identifier'|'user-confirmed'; originalId:string|null; corrections:Array<{at:string;method:string}> }
export interface Claim { id:string;type:string;value:string;eventId:string;start:number;end:number;method:string;uncertainty:string }
export interface EvidenceCheck { id:string;state:VerificationState;detail:string;source:'none'|'fixture';value:string;checkedAt:string;sourceDate:string|null;availability:SourceMode;limitation:string }
export interface RiskFinding { id:string;rule:string;version:string;eventId:string;severity:Severity;label:string;excerpt:string;start:number;end:number;checkedAt:string;uncertainty:string }
export interface InvestmentCase { id:string;events:EvidenceEvent[];fixture:boolean;sourceMode:SourceMode;synthetic:boolean;createdAt:string;updatedAt:string;response:string;paid:boolean }
export interface Vault { schema:1;cases:InvestmentCase[];settings:{retention:1|7|30;save:boolean} }

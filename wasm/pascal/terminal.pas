program OuroborosTerminal;

{$mode objfpc}{$H+}

uses
  SysUtils;

const
  MAX_INPUT_LENGTH = 256;
  MAX_COMMAND_LENGTH = 1024;

type
  TCommandType = (
    cmdProposeMutation,
    cmdVote,
    cmdQueryBlockchain,
    cmdGetQuantumEntropy,
    cmdGetBioSensors,
    cmdStatus,
    cmdHelp,
    cmdUnknown
  );

var
  running: Boolean;
  inputBuffer: String;
  commandBuffer: String;

{ External JavaScript bridge functions }
{ These will be imported from JavaScript }
procedure JSBridge_SubmitProposal(code: PChar; language: PChar); external 'env' name 'jsbridge_submit_proposal';
procedure JSBridge_Vote(proposalId: LongInt; support: Boolean); external 'env' name 'jsbridge_vote';
procedure JSBridge_QueryBlockchain(generation: LongInt); external 'env' name 'jsbridge_query_blockchain';
procedure JSBridge_GetQuantumEntropy; external 'env' name 'jsbridge_get_quantum_entropy';
procedure JSBridge_GetBioSensors; external 'env' name 'jsbridge_get_bio_sensors';
procedure JSBridge_GetStatus; external 'env' name 'jsbridge_get_status';
procedure JSBridge_DisplayText(text: PChar); external 'env' name 'jsbridge_display_text';
procedure JSBridge_DisplayError(text: PChar); external 'env' name 'jsbridge_display_error';
procedure JSBridge_DisplaySuccess(text: PChar); external 'env' name 'jsbridge_display_success';
procedure JSBridge_DisplayInfo(text: PChar); external 'env' name 'jsbridge_display_info';

{ Initialize terminal }
procedure InitTerminal;
begin
  running := True;
  inputBuffer := '';
  commandBuffer := '';
  
  JSBridge_DisplaySuccess(PChar('OuroborOS-Chimera Terminal v1.0'));
  JSBridge_DisplayInfo(PChar('Pascal WASM Terminal Interface'));
  JSBridge_DisplayText(PChar(''));
  JSBridge_DisplayInfo(PChar('Type "help" for available commands'));
  JSBridge_DisplayText(PChar(''));
end;

{ Display help information }
procedure DisplayHelp;
begin
  JSBridge_DisplayText(PChar(''));
  JSBridge_DisplaySuccess(PChar('=== OuroborOS-Chimera Commands ==='));
  JSBridge_DisplayText(PChar(''));
  JSBridge_DisplayInfo(PChar('Blockchain Governance:'));
  JSBridge_DisplayText(PChar('  propose-mutation <language> <code>  - Submit mutation proposal'));
  JSBridge_DisplayText(PChar('  vote <id> <yes|no>                  - Vote on proposal'));
  JSBridge_DisplayText(PChar('  query-chain <generation>            - Query blockchain history'));
  JSBridge_DisplayText(PChar(''));
  JSBridge_DisplayInfo(PChar('External Services:'));
  JSBridge_DisplayText(PChar('  quantum-entropy                     - Get quantum random bits'));
  JSBridge_DisplayText(PChar('  bio-sensors                         - Read physical sensors'));
  JSBridge_DisplayText(PChar('  status                              - Display organism status'));
  JSBridge_DisplayText(PChar(''));
  JSBridge_DisplayInfo(PChar('Utility:'));
  JSBridge_DisplayText(PChar('  help                                - Show this help'));
  JSBridge_DisplayText(PChar('  exit                                - Exit terminal'));
  JSBridge_DisplayText(PChar(''));
end;

{ Parse command type from string }
function ParseCommandType(const cmd: String): TCommandType;
var
  lowerCmd: String;
begin
  lowerCmd := LowerCase(cmd);
  
  if lowerCmd = 'propose-mutation' then
    Result := cmdProposeMutation
  else if lowerCmd = 'vote' then
    Result := cmdVote
  else if lowerCmd = 'query-chain' then
    Result := cmdQueryBlockchain
  else if lowerCmd = 'quantum-entropy' then
    Result := cmdGetQuantumEntropy
  else if lowerCmd = 'bio-sensors' then
    Result := cmdGetBioSensors
  else if lowerCmd = 'status' then
    Result := cmdStatus
  else if lowerCmd = 'help' then
    Result := cmdHelp
  else
    Result := cmdUnknown;
end;

{ Extract argument from command string }
function GetArgument(const cmd: String; argIndex: Integer): String;
var
  parts: array of String;
  i, count: Integer;
  inQuote: Boolean;
  currentPart: String;
  ch: Char;
begin
  SetLength(parts, 0);
  count := 0;
  inQuote := False;
  currentPart := '';
  
  { Parse command into parts, respecting quotes }
  for i := 1 to Length(cmd) do
  begin
    ch := cmd[i];
    
    if ch = '"' then
    begin
      inQuote := not inQuote;
    end
    else if (ch = ' ') and (not inQuote) then
    begin
      if Length(currentPart) > 0 then
      begin
        SetLength(parts, count + 1);
        parts[count] := currentPart;
        Inc(count);
        currentPart := '';
      end;
    end
    else
    begin
      currentPart := currentPart + ch;
    end;
  end;
  
  { Add last part }
  if Length(currentPart) > 0 then
  begin
    SetLength(parts, count + 1);
    parts[count] := currentPart;
    Inc(count);
  end;
  
  { Return requested argument }
  if (argIndex >= 0) and (argIndex < count) then
    Result := parts[argIndex]
  else
    Result := '';
end;

{ Handle propose-mutation command }
procedure HandleProposeMutation(const args: String);
var
  language, code: String;
  restOfCommand: String;
  spacePos: Integer;
begin
  language := GetArgument(args, 0);
  
  if language = '' then
  begin
    JSBridge_DisplayError(PChar('Error: No language specified'));
    JSBridge_DisplayInfo(PChar('Usage: propose-mutation <language> <code>'));
    JSBridge_DisplayInfo(PChar('Languages: algol, lisp, pascal, rust, go, fortran'));
    Exit;
  end;
  
  { Get rest of command as code }
  spacePos := Pos(' ', args);
  if spacePos > 0 then
    restOfCommand := Copy(args, spacePos + 1, Length(args))
  else
    restOfCommand := '';
  
  code := Trim(restOfCommand);
  
  if code = '' then
  begin
    JSBridge_DisplayError(PChar('Error: No code provided'));
    JSBridge_DisplayInfo(PChar('Usage: propose-mutation <language> <code>'));
    Exit;
  end;
  
  JSBridge_DisplayInfo(PChar('Submitting mutation proposal...'));
  JSBridge_SubmitProposal(PChar(code), PChar(language));
end;

{ Handle vote command }
procedure HandleVote(const args: String);
var
  proposalIdStr, supportStr: String;
  proposalId: LongInt;
  support: Boolean;
  errorCode: Integer;
begin
  proposalIdStr := GetArgument(args, 0);
  supportStr := GetArgument(args, 1);
  
  if (proposalIdStr = '') or (supportStr = '') then
  begin
    JSBridge_DisplayError(PChar('Error: Missing arguments'));
    JSBridge_DisplayInfo(PChar('Usage: vote <proposal_id> <yes|no>'));
    Exit;
  end;
  
  { Parse proposal ID }
  Val(proposalIdStr, proposalId, errorCode);
  if errorCode <> 0 then
  begin
    JSBridge_DisplayError(PChar('Error: Invalid proposal ID'));
    Exit;
  end;
  
  { Parse support }
  supportStr := LowerCase(supportStr);
  if (supportStr = 'yes') or (supportStr = 'y') or (supportStr = 'true') then
    support := True
  else if (supportStr = 'no') or (supportStr = 'n') or (supportStr = 'false') then
    support := False
  else
  begin
    JSBridge_DisplayError(PChar('Error: Invalid vote (use yes or no)'));
    Exit;
  end;
  
  JSBridge_DisplayInfo(PChar('Submitting vote...'));
  JSBridge_Vote(proposalId, support);
end;

{ Handle query-chain command }
procedure HandleQueryBlockchain(const args: String);
var
  generationStr: String;
  generation: LongInt;
  errorCode: Integer;
begin
  generationStr := GetArgument(args, 0);
  
  if generationStr = '' then
  begin
    JSBridge_DisplayError(PChar('Error: No generation specified'));
    JSBridge_DisplayInfo(PChar('Usage: query-chain <generation>'));
    Exit;
  end;
  
  { Parse generation number }
  Val(generationStr, generation, errorCode);
  if errorCode <> 0 then
  begin
    JSBridge_DisplayError(PChar('Error: Invalid generation number'));
    Exit;
  end;
  
  JSBridge_DisplayInfo(PChar('Querying blockchain...'));
  JSBridge_QueryBlockchain(generation);
end;

{ Handle quantum-entropy command }
procedure HandleQuantumEntropy;
begin
  JSBridge_DisplayInfo(PChar('Requesting quantum entropy...'));
  JSBridge_GetQuantumEntropy;
end;

{ Handle bio-sensors command }
procedure HandleBioSensors;
begin
  JSBridge_DisplayInfo(PChar('Reading bio sensors...'));
  JSBridge_GetBioSensors;
end;

{ Handle status command }
procedure HandleStatus;
begin
  JSBridge_DisplayInfo(PChar('Fetching organism status...'));
  JSBridge_GetStatus;
end;

{ Main command dispatcher }
procedure HandleCommand(const cmd: String);
var
  commandType: TCommandType;
  firstWord: String;
  restOfCommand: String;
  spacePos: Integer;
begin
  if Trim(cmd) = '' then
    Exit;
  
  { Handle exit command }
  if LowerCase(Trim(cmd)) = 'exit' then
  begin
    running := False;
    JSBridge_DisplayInfo(PChar('Exiting terminal...'));
    Exit;
  end;
  
  { Split command into first word and rest }
  spacePos := Pos(' ', cmd);
  if spacePos > 0 then
  begin
    firstWord := Copy(cmd, 1, spacePos - 1);
    restOfCommand := Copy(cmd, spacePos + 1, Length(cmd));
  end
  else
  begin
    firstWord := cmd;
    restOfCommand := '';
  end;
  
  { Parse and dispatch command }
  commandType := ParseCommandType(firstWord);
  
  case commandType of
    cmdProposeMutation:
      HandleProposeMutation(restOfCommand);
    cmdVote:
      HandleVote(restOfCommand);
    cmdQueryBlockchain:
      HandleQueryBlockchain(restOfCommand);
    cmdGetQuantumEntropy:
      HandleQuantumEntropy;
    cmdGetBioSensors:
      HandleBioSensors;
    cmdStatus:
      HandleStatus;
    cmdHelp:
      DisplayHelp;
    cmdUnknown:
      begin
        JSBridge_DisplayError(PChar('Unknown command: ' + firstWord));
        JSBridge_DisplayInfo(PChar('Type "help" for available commands'));
      end;
  end;
end;

{ Exported function: Process command from JavaScript }
procedure ProcessCommand(cmdPtr: PChar); cdecl; export;
var
  cmd: String;
begin
  cmd := String(cmdPtr);
  HandleCommand(cmd);
end;

{ Exported function: Initialize terminal }
procedure Initialize; cdecl; export;
begin
  InitTerminal;
end;

{ Exported function: Check if running }
function IsRunning: Boolean; cdecl; export;
begin
  Result := running;
end;

{ Main program - not used in WASM, but required for compilation }
begin
  { WASM modules don't execute main, they export functions }
end.

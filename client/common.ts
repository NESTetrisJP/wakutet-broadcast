export function toFullwidthName(name: string): string {
  const resultArr: string[] = new Array(name.length);
  for (let i = 0; i < name.length; i++) {
    const code = name.charCodeAt(i);
    if (code >= 33 && code <= 126) {
      resultArr[i] = String.fromCharCode(code + 65248);
    } else {
      resultArr[i] = name.charAt(i);
    }
  }
  return resultArr.join("");
}

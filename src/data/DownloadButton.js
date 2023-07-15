import React, { useEffect } from 'react';
import '../css/download-button.css';

function DownloadButton(props) {
  useEffect(() => {
    const downloadBtn = document.getElementById('download-btn');

    if (navigator.appVersion.indexOf('Mac') !== -1) {
      if (navigator.platform.includes('arm')) {
        downloadBtn.href = props.macArmDownloadUrl;
      } else {
        downloadBtn.href = props.macDownloadUrl;
      }
    } else if (navigator.appVersion.indexOf('Win') !== -1) {
      if (navigator.platform.includes('x86')) {
        downloadBtn.href = props.windowsX86DownloadUrl;
      } else {
        downloadBtn.href = props.windowsX64DownloadUrl;
      }
    } else if (navigator.appVersion.indexOf('Linux') !== -1) {
      if (navigator.platform.includes('arm')) {
        downloadBtn.href = props.linuxArmDownloadUrl;
      } else if (navigator.platform.includes('x86')) {
        downloadBtn.href = props.linuxX86DownloadUrl;
      } else {
        downloadBtn.href = props.linuxX64DownloadUrl;
      }
    } else {
      downloadBtn.href = '#';
      downloadBtn.disabled = true;
    }
  }, [
    props.macDownloadUrl,
    props.macArmDownloadUrl,
    props.windowsX86DownloadUrl,
    props.windowsX64DownloadUrl,
    props.linuxX86DownloadUrl,
    props.linuxX64DownloadUrl,
    props.linuxArmDownloadUrl,
  ]);

  return (
    <a href="#" id="download-btn" className="primary-btn">
      {props.buttonText}
    </a>
  );
}

export default DownloadButton;
